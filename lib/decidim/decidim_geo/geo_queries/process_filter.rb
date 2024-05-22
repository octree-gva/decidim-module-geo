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

        def apply_filters(process_ids)
          return [] unless manifest # Not registered as Decidim participatory space.

          public_spaces = manifest.participatory_spaces.call(organization).public_spaces.where(id: process_ids)
          return public_spaces if filters.empty?

          scoped_by_geoencoded(scoped_by_time(public_spaces))
        end

        private

        def scoped_by_geoencoded(public_spaces)
          if !geoencode_filtered?
            public_spaces.left_joins(:decidim_geo_space_location)
          elsif only_geoencoded?
            public_spaces.joins(:decidim_geo_space_location).where.not(decidim_geo_space_location: { latitude: nil })
          elsif exclude_geoencoded?
            public_spaces.left_joins(:decidim_geo_space_location).where(decidim_geo_space_location: { latitude: nil })
          end
        end

        def scoped_by_time(public_spaces)
          case time_filter
          when "active"
            public_spaces.active_spaces
          when "future"
            public_spaces.future_spaces
          when "past"
            public_spaces.past_spaces
          else
            public_spaces
          end
        end

        def manifest
          @manifest ||= Decidim.participatory_space_manifests.find do |manifest|
            manifest.name == :participatory_processes
          end
        end
      end
    end
  end
end
