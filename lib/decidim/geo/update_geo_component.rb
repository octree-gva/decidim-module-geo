# frozen_string_literal: true

module Decidim
  module Geo
    # Override component's behaviour, to trigger each child
    # on update
    module UpdateGeoComponent
      extend ActiveSupport::Concern

      included do
        after_commit :update_decidim_geo_index

        def update_decidim_geo_index
          component_id = id
          registry = Decidim::Geo::ManifestRegistry.instance
          model_klass = registry.model_for(manifest_name)
          model_klass.where(component: component_id).each(&:update_decidim_geo_index)
        rescue StandardError => e
          Rails.logger.debug { "ERROR: manifest #{manifest_name} not supported" }
        end

        def decidim_geo_manifest
          manifest_name
        end

        def decidim_geo_space_manifest
          space.manifest.name if space && space.manifest
        end
      end
    end
  end
end
