# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class GenericFilter
        extend Forwardable

        def_delegators :@geo_query, :organization, :current_user, :locale, :filters, :participatory_spaces
        attr_reader :geo_query, :options

        def initialize(geo_query)
          @geo_query = geo_query
        end

        ##
        # Gives the klass name of the model
        def self.model_klass
          raise "not implemented.@see #{name}#model_klass"
        end
        ##
        # If the filter is active for this manifest
        def self.active_for_manifest?(manifest_name)
          raise "not implemented.@see #{name}#active_for_manifest?"
        end

        def model_klass
          self.class.model_klass
        end

        def self.klass
          @klass ||= model_klass.constantize
        end

        def klass
          self.class.klass
        end

        ##
        # The symbol that discrimine the filter.
        # For example :scope_id, :assembly_id, etc.
        def self.graphql_key
          raise "not implemented."
        end

        def graphql_key
          self.class.graphql_key
        end

        ##
        # If the filter is for a component
        def component?
          klass.include? Decidim::HasComponent
        end

        ##
        # If the filter is for a participatory space
        def participatory_space?
          klass.include? Decidim::ScopableParticipatorySpace
        end

        ##
        # Take the given matches ids.
        # Should be implemented in child classes.
        def apply_filters(_matches)
          raise "not implemented."
        end

        def search_context
          klass.all
        end

        ##
        #
        def results(scope_ids = [], id = nil)
          matches = if component?
                      if !participatory_spaces.empty? && participatory_spaces.size == 1 && participatory_spaces.first[:participatory_space_id].size == 1
                        search_context.joins(:component)
                      else
                        search_context
                          .joins(:component)
                          .joins(<<~SQL
                          INNER JOIN "decidim_geo_no_indexes" 
                          ON 
                            "decidim_geo_no_indexes"."decidim_component_type" = 'Decidim::Component' 
                            AND "decidim_geo_no_indexes"."decidim_component_id" = "component"."id"
                            AND "decidim_geo_no_indexes"."no_index" IS FALSE
SQL
                          )
                      end
                    else
                      search_context
                    end
          matches = apply_filters(matches)

          matches = if scope_ids.empty?
                      matches
                    else
                      filtered_by_scope(matches, scope_ids)
                    end

          matches = if component? && !participatory_spaces.empty?
                      if participatory_spaces.size == 1
                        
                        participatory_space = participatory_spaces.first
                        matches = matches.where(component: participatory_space)
                        
                      else
                        first_participatory_space = participatory_spaces.first
                        filtered_matches = matches
                        match_space = matches.where(component: first_participatory_space)
                        # It's a component, filtered by space
                        participatory_spaces[1..].each do |ps|
                          matches = match_space.or(filtered_matches.where(component: ps))
                        end
                        matches
                      end
                      matches
                    elsif participatory_space? && !participatory_spaces.empty?
                      # It's participatory space, filtered by spaces.
                      restrict_ids = participatory_spaces.select do |ps|
                        ps[:participatory_space_type] == model_klass
                      end.collect do |ps|
                        ps[:participatory_space_id]
                      end.flatten

                      matches = if restrict_ids.empty?
                                  matches
                                else
                                  matches.where(id: restrict_ids)
                      end
                    else
                      matches
          end

          matches = matches.where(id: id) unless id.nil?
          matches
        end

        protected

        def filtered_by_scope(matches, scope_ids)
          return matches.where(decidim_scope_id: scope_ids) if participatory_space?

          matches = matches.where(decidim_scope_id: scope_ids)
          spaces_in_scopes(scope_ids).each do |scope_params|
            matches = matches.or(
              matches.joins(:component).where(component: scope_params)
            )
          end
          matches
        end

        def extract_time_filter
          @extract_time_filter ||= filters.find { |f| f[:time_filter].present? }
        end

        def time_filter
          return nil if extract_time_filter.nil?

          extract_time_filter.time_filter.time
        end

        def geoencode_filtered?
          !geoencoded_filter.nil?
        end

        def only_geoencoded?
          geoencode_filtered? && geoencoded_filter.geoencoded_filter.geoencoded
        end

        def exclude_geoencoded?
          geoencode_filtered? && !geoencoded_filter.geoencoded_filter.geoencoded
        end

        def geoencoded_filter
          @geoencoded_filter ||= filters.find { |f| f[:geoencoded_filter].present? }
        end

        private

        ##
        # Get spaces types and ids in the scope
        def spaces_in_scopes(scope_ids)
          scope_ids
          active_space_filters.map do |active_space|
            [
              active_space.model_klass,
              active_space.search_context.where(decidim_scope_id: scope_ids)
            ]
          end.select do |_model_klass, query|
            query.exists?
          end.map do |model_klass, query|
            {
              decidim_participatory_space_type: model_klass,
              decidim_participatory_space_id: query.ids
            }
          end
        end

        def active_space_filters
          @active_space_filters ||= ::Decidim::Geo.config.supported_filters.map do |filter|
            filter.constantize.new(geo_query)
          end.select(&:participatory_space?)
        end
      end
    end
  end
end
