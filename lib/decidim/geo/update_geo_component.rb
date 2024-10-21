# frozen_string_literal: true

module Decidim
  module Geo
    # Override component's behaviour, to trigger each child
    # on update
    module UpdateGeoComponent
      extend ActiveSupport::Concern

      included do
        after_commit :update_decidim_geo_index
        before_save :set_decidim_geo_trigger_changes
        def set_decidim_geo_trigger_changes
          @decidim_geo_trigger_changes = !changes.empty?
        end
        def update_decidim_geo_index
          return unless @decidim_geo_trigger_changes
          component_id = id
          registry = Decidim::Geo::ManifestRegistry.instance
          model_klass = registry.model_for(manifest_name)

          attached = model_klass.where(component: component_id)
          Decidim::Geo::Index.where(component_id: component_id, resource_type: manifest_name).where.not(resource_id: attached.ids).each {|ind| ind.destroy }
          attached.each(&:update_decidim_geo_index)
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
