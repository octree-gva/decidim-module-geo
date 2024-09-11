# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class ProcessFilter < GenericFilter
        def self.model_klass
          "Decidim::ParticipatoryProcess"
        end

        def self.graphql_key
          :process_filter
        end

        def apply_filters(processes)
          matches = scoped_by_geoencoded(scoped_by_time(processes))
          if process_filter.empty?
            matches
          else
            matches.where(id: process_filter)
          end
        end

        def search_context
          klass.visible_for(current_user)
        end

        private

        def process_filter
          @process_filter ||= begin
            processes = filters.select { |f| f[:process_filter].present? }
            if processes.empty?
              []
            else
              processes.collect { |f| f[:process_filter][:id] }
            end
          end
        end

        def scoped_by_geoencoded(processes)
          if !geoencode_filtered?
            processes.left_joins(:decidim_geo_space_location)
          elsif only_geoencoded?
            processes.joins(:decidim_geo_space_location).where.not(decidim_geo_space_location: { latitude: nil })
          elsif exclude_geoencoded?
            processes.left_joins(:decidim_geo_space_location).where(decidim_geo_space_location: { latitude: nil })
          end
        end

        def scoped_by_time(processes)
          case time_filter
          when "active"
            processes.active_spaces
          when "future"
            processes.future_spaces
          when "past"
            processes.past_spaces
          else
            processes
          end
        end
      end
    end
  end
end
