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
          fetch_results(filtered_data)
        end

        def results_count
          count_results(filtered_data)
        end

        private

        def filtered_data
          @filtered_data ||= if normalized_filters.present?
                               data_by_resource_type(query)
                             else
                               data_by_resource_type(nofilter_query)
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

        def query
          search_params = { locale: locale, class_name: supported_geo_components }

          # Handle scope constraints
          scopes = normalized_filters.select { |f| f[:scope_filter].present? }
          if scopes.length.positive?
            # Search only in a given scope
            scope_ids = scopes.map do |scope|
              scope[:scope_filter][:scope_id]
            end
            search_params = search_params.merge({ scope_ids: scope_ids })
          end
          filtered_by_scopes = scopes.length.positive?

          # Handle participatory spaces filter (Assemblies, Processes, Conferences, Initiatives)
          space_filters = active_filters.select(&:is_participatory_space?).select do |filter|
            key = filter.graphql_key
            normalized_filters.any? { |f| f[key].present? }
          end
          # Handle resource type filter (only Meetings)
          resource_type = normalized_filters.find { |f| f[:resource_type_filter].present? }
          # Define class_name search.
          # if resource_type is "all" => do nothing
          # else if resource_type is defined => search the resource type everywhere
          # else if we are filtering by space => exclude all the other kind of spaces in the filter.
          if resource_type
            # Search only for a resource type
            class_name = resource_type.resource_type_filter.resource_type

            search_params = search_params.merge({ class_name: class_name }) unless class_name == "all"
          elsif space_filters.length.positive?
            # Exclude all the spaces that are not included in the filter.
            not_filtered_spaces = space_filters.select do |filter|
              normalized_filters.find { |f| f[filter.graphql_key].present? }.nil?
            end.map(&:model_klass)
            class_name = supported_geo_components.reject do |k|
              not_filtered_spaces.include?(k)
            end
            search_params = search_params.merge({ class_name: class_name })
          end
          search_results = filtered_query_for(**search_params)

          # Bind results to the selected spaces.
          space_filters.each do |space_filter|
            graphql_key = space_filter.graphql_key
            ids = normalized_filters.select { |f| f[graphql_key].present? }.map do |graphql_filter|
              graphql_filter[graphql_key][:id]
            end
            # The results must be within the filtered space
            search_results = search_results.where(
              decidim_participatory_space_type: space_filter.model_klass,
              decidim_participatory_space_id: ids
            )
          end
          search_results
        end

        def active_filters
          @active_filters ||= ::Decidim::Geo.config.supported_filters.map do |filter|
            filter.constantize.new(self)
          end
        end

        def supported_geo_components
          active_filters.map(&:model_klass)
        end

        def nofilter_query
          filtered_query_for(locale: locale, class_name: supported_geo_components)
        end

        def filtered_query_for(class_name: nil, id: nil, term: nil, scope_ids: nil, space_state: nil, locale: nil, spaces: nil)
          query = { organization: organization,
                    locale: locale,
                    resource_type: class_name }
          result_query = SearchableResource.where(query)
          if scope_ids.present?
            if spaces.present?
              # If searching a scope AND a space, then should look in BOTH
              # => scope || space.
              space_query = query.dup
              space_query.update(decidim_participatory_space: spaces)
              result_query.or(
                SearchableResource.where(space_query)
              )
            end
            query.update(decidim_scope_id: scope_ids)
          elsif spaces.present?
            query.update(decidim_participatory_space: spaces) if spaces.present?
          end
          query.update(resource_id: id) if id.present?
          result_query = result_query.order("datetime DESC")
          result_query = result_query.global_search(I18n.transliterate(term)) if term.present?
          result_query
        end

        def fetch_results(data)
          # Apply resource specific filtering
          active_filters.map do |filter|
            matches = data[filter.model_klass] || []
            filter.apply_filters(matches)
          end.flatten
        end

        def count_results(data)
          # Apply resource specific filtering
          active_filters.map do |filter|
            matches = data[filter.model_klass] || []
            filter.apply_filters(matches).count
          end.sum
        end

        def data_by_resource_type(searchable_results)
          results = {}
          # Fetch resources, and store them by type
          searchable_results.select("resource_id,resource_type").each do |resource|
            if results[resource.resource_type].blank?
              results[resource.resource_type] =
                []
            end
            results[resource.resource_type].push(resource.resource_id)
          end
          results
        end
      end
    end
  end
end
