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

        def apply_filters(assembly_ids)
          return [] unless manifest # Not registered as Decidim participatory space.

          assemblies = Decidim::Assembly.visible_for(current_user).where(id: assembly_ids)
          scoped_by_geoencoded(scoped_by_time(assemblies))
        end

        private

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
          scoped_assemblies = case time_filter
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

        def manifest
          @manifest ||= Decidim.participatory_space_manifests.find do |manifest|
            manifest.name == :assemblies
          end
        end
      end
    end
  end
end
