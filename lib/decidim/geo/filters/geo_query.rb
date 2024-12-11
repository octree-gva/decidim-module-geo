# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class GeoQuery
        attr_reader :locale, :graphql_params, :organization, :current_user, :params

        delegate :count, to: :results, prefix: true

        def initialize(organization, current_user, params, locale)
          @locale = locale || I18n.locale
          @params = params
          @graphql_params = normalize_graphql_params(params[:filters]) || {}
          @organization = organization
          @current_user = current_user
        end

        def results
          query = Decidim::Geo::Index.all
          query = query.geolocated if geolocated? || config.force_geoencoded?
          return query.indexed if graphql_params.empty?

          query = indexed_query(query) if only_indexed?
          query = query.virtual if virtual?
          # Filter on scopes
          unless scope_ids_params.empty?
            query = query.where(
              geo_scope_id: scope_ids_params
            )
          end

          # Filter on spaces
          unless process_params.empty?
            query = query.where(
              participatory_space_type: :participatory_processes,
              participatory_space_id: process_params
            )
          end

          unless assembly_params.empty?
            query = query.where(
              participatory_space_type: :assemblies,
              participatory_space_id: assembly_params
            )
          end

          if !resource_type_params.empty? && resource_type_params.first != "all"
            query = query.where(
              resource_type: resource_type_params
            )
          end

          active_time_filter = time_filter_params && time_filter_params[:time_filter][:time]

          if active_time_filter && active_time_filter != "all"
            time_filters = resource_type_params.map do |manifest|
              time_filter_class = ::Decidim::Geo.registry.time_filter_for(manifest)
              filter = time_filter_class.new(self, manifest)
              case active_time_filter
              when "active"
                filter.filter_active(query)
              when "past"
                filter.filter_past(query)
              when "future"
                filter.filter_future(query)
              else
                raise "Unkown time filter #{active_time_filter}"
              end
            end
            unless time_filters.empty?
              query = begin
                time_filter_chain = time_filters.pop
                time_filters.each do |or_time_filter|
                  time_filter_chain = time_filter_chain.or(or_time_filter)
                end
                time_filter_chain
              end
            end
          end
          query
        end

        private

        def indexed_query(query)
          return query.indexed unless process_groups?
          query.indexed.or(query.where(
                             participatory_space_id: process_params,
                             avoid_index: true
                           ))
        end

        def config
          @config ||= Decidim::Geo::GeoConfig.geo_config_default
        end

        def active_manifests_names
          @active_manifests_names ||= ::Decidim::Geo.registry.active_manifests(&:keys)
        end

        def normalize_graphql_params(graphql_params)
          graphql_params.map do |hash|
            next hash unless hash.is_a?(Hash)

            hash.deep_transform_keys { |key| key.to_s.underscore.to_sym }
                .deep_transform_values { |value| value.is_a?(Hash) ? value.with_indifferent_access : value }
                .with_indifferent_access
          end
        end

        def time_filter_params
          graphql_params.find { |f| f[:time_filter].present? }
        end

        def only_indexed?
          params.has_key?(:is_index) && params[:is_index]
        end

        def process_groups?
          params.has_key?(:is_group) && params[:is_group]
        end

        def assembly_groups?
          assembly_params.size > 1
        end

        def assembly_params
          @assembly_params ||= graphql_params.select { |f| f[:assembly_filter].present? }.map do |graphql_param|
            graphql_param[:assembly_filter][:id].to_i
          end
        end

        def resource_type_params
          @resource_type_params ||= begin
            match = graphql_params.find { |f| f[:resource_type_filter].present? }
            if match
              resource = match[:resource_type_filter][:resource_type].to_s
              if resource == "all"
                active_manifests_names
              else
                [resource]
              end
            else
              active_manifests_names
            end
          end
        end

        def process_params
          @process_params ||= graphql_params.select { |f| f[:process_filter].present? }.map do |graphql_param|
            graphql_param[:process_filter][:id].to_i
          end
        end

        def geolocated?
          geolocated_params &&
            geolocated_params[:geoencoded_filter] &&
            geolocated_params[:geoencoded_filter][:geoencoded]
        end

        def virtual?
          geolocated_params &&
            geolocated_params[:geoencoded_filter] &&
            !geolocated_params[:geoencoded_filter][:geoencoded]
        end

        def geolocated_params
          graphql_params.find { |f| f[:geoencoded_filter].present? }
        end

        def scope_ids_params
          @scope_ids_params ||= graphql_params.select { |f| f[:scope_filter].present? }.map do |graphql_param|
            graphql_param[:scope_filter][:scope_id]
          end
        end

        def time_filters
          @time_filters ||= ::Decidim::Geo.registry.active_manifests do |manifests|
            manifests.map { |config| config[:time_filter].new(self) }
          end
        end

        def spaces_time_filter
          @spaces_time_filter ||= time_filters.select(&:participatory_space?)
        end

        def components_time_filter
          @components_time_filter ||= time_filters.select(&:component?)
        end
      end
    end
  end
end
