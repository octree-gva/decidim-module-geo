# frozen_string_literal: true

module Decidim
  module Geo
    module UpdateGeoIndex
      extend ActiveSupport::Concern

      included do
        after_commit :update_decidim_geo_index

        def update_decidim_geo_index
          unless decidim_geo_enabled?
            Rails.logger.debug { "manifest not enabled: '#{decidim_geo_manifest}'" }
            return
          end
          registry = Decidim::Geo::ManifestRegistry.instance
          updater = registry.updater_for(decidim_geo_manifest)
          raise "Internal error: no updater registred for #{decidim_geo_manifest}" unless updater

          updater.perform_now(id)
        end

        private

        def decidim_geo_manifest
          @decidim_geo_manifest ||= if self.class.include? Decidim::HasComponent
                                      # It's a resource
                                      component.manifest.name if component && component.manifest
                                    elsif instance_of?(Decidim::Component) || self.class.include?(Decidim::ScopableParticipatorySpace)
                                      # It's a component or a participatory space
                                      manifest.name if manifest
                                    end
        end

        def decidim_geo_enabled?
          return false unless decidim_geo_manifest

          Decidim::Geo::ManifestRegistry.instance.enabled?(decidim_geo_manifest)
        end
      end
    end
  end
end
