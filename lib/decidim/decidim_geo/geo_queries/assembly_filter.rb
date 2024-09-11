# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class AssemblyFilter < GenericFilter
        def self.model_klass
          "Decidim::Assembly"
        end

        def self.graphql_key
          :assembly_filter
        end

        def apply_filters(assemblies)
          matches = scoped_by_geoencoded(scoped_by_time(assemblies))
          if assembly_filter.empty?
            matches
          else
            matches.where(id: assembly_filter).or(matches.where(parent_id: assembly_filter))
          end
        end

        def search_context
          klass.visible_for(current_user)
        end

        private

        def assembly_filter
          @assembly_filter ||= begin
            processes = filters.select { |f| f[:assembly_filter].present? }
            if processes.empty?
              []
            else
              processes.collect { |f| f[:assembly_filter][:id] }
            end
          end
        end

        def scoped_by_geoencoded(assemblies)
          if !geoencode_filtered?
            assemblies.left_joins(:decidim_geo_space_location)
          elsif only_geoencoded?
            assemblies.joins(:decidim_geo_space_location).where.not(decidim_geo_space_location: { latitude: nil })
          elsif exclude_geoencoded?
            assemblies.left_joins(:decidim_geo_space_location).where(decidim_geo_space_location: { latitude: nil })
          end
        end

        def scoped_by_time(assemblies)
          case time_filter
          when "past"
            assemblies.where("duration < ?", Time.zone.now)
          when "active"
            assemblies.where(duration: 15.days.ago..15.days.from_now).or(
              assemblies.where(duration: nil)
            )
          when "future"
            assemblies.where("duration > ?", Time.zone.now)
          else
            assemblies
          end
        end
      end
    end
  end
end
