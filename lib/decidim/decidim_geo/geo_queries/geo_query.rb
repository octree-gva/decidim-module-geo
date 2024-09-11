# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class GeoQuery
        attr_reader :locale, :filters, :organization, :current_user

        def initialize(organization, current_user, filters, locale)
          @locale = locale || I18n.locale
          @filters = filters || []
          @organization = organization
          @current_user = current_user
        end

        def results
          fetch_results
        end

        def results_count
          count_results
        end

        def participatory_spaces
          @participatory_spaces ||= begin
            matches = active_space_filters.map do |space_filter|
              [
                space_filter.model_klass,
                normalized_filters.select do |filter|
                  filter[space_filter.graphql_key].present?
                end.collect { |filter| filter[space_filter.graphql_key][:id] }
              ]
            end.reject { |_model_klass, ids| ids.empty? }.map do |model_klass, ids|
              {
                participatory_space_type: model_klass,
                participatory_space_id: model_klass.constantize.visible_for(current_user).where(id: ids).ids
              }
            end

            if matches.size.positive?
              matches
            else
              default_participatory_spaces
            end
          end
        end

        private

        def default_participatory_spaces
          @default_participatory_spaces ||= active_space_filters.map do |space_filter|
            {
              participatory_space_type: space_filter.model_klass,
              participatory_space_id: space_filter.klass.visible_for(current_user).ids
            }
          end
        end

        def normalized_filters
          return filters unless filters.is_a?(Array)

          @normalized_filters ||= filters.map do |hash|
            next hash unless hash.is_a?(Hash)

            hash.deep_transform_keys { |key| key.to_s.underscore.to_sym }
                .deep_transform_values { |value| value.is_a?(Hash) ? value.with_indifferent_access : value }
                .with_indifferent_access
          end
        end

        def active_filters
          @active_filters ||= ::Decidim::Geo.config.supported_filters.map do |filter|
            filter.constantize.new(self)
          end
        end

        def supported_geo_components
          active_filters.map(&:model_klass)
        end

        def scope_ids_params
          @scope_ids_params ||= normalized_filters.select { |f| f[:scope_filter].present? }.map do |filter|
            filter[:scope_filter][:scope_id]
          end
        end

        def id_params
          nil
        end

        def active_space_filters
          @active_space_filters ||= active_filters.select(&:participatory_space?)
        end

        def resource_filters
          @resource_filters ||= begin
            resource_type = normalized_filters.find { |f| f[:resource_type_filter].present? }
            filters = if participatory_spaces
                        participatory_spaces_types = participatory_spaces.collect { |ps| ps[:participatory_space_type] }
                        active_filters.select { |filter| filter.component? || participatory_spaces_types.include?(filter.model_klass) }
                      else
                        active_filters
            end
            if resource_type
              # Search only for a resource type
              class_name = resource_type.resource_type_filter.resource_type
              return filters if class_name == "all"

              filters.select do |filter|
                filter.model_klass == class_name
              end
            else
              filters
            end
          end
        end

        def fetch_results
          # Apply resource specific filtering
          resource_filters.map do |filter|
            [filter, filter.results(scope_ids_params, id_params)]
          end
        end

        def count_results
          # Apply resource specific filtering
          resource_filters.map do |filter|
            matches = filter.results(scope_ids_params, id_params)
            matches.count
          end.sum
        end
      end
    end
  end
end
