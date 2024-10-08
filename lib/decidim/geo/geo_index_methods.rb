module Decidim
    module Geo
        module GeoIndexMethods
            include Decidim::Geo::GenericSerializer
            def upsert_index(resource_id, resource_type, decidim_geo_hash)
                decidim_geo_hash = with_no_index(decidim_geo_hash)
                lat = decidim_geo_hash.delete(:latitude)
                lon = decidim_geo_hash.delete(:longitude)
                
                index = Decidim::Geo::Index.find_or_initialize_by(resource_id: resource_id, resource_type: resource_type) do |record|
                  record.assign_attributes(decidim_geo_hash)
                end
                index.assign_attributes(decidim_geo_hash)
                
                index.lonlat = if lat && lon && !lat.nan? && !lon.nan?
                    factory = Decidim::Geo.point_factory
                    factory.point(lon, lat)
                else
                    nil
                end

                index.resource_id = resource_id
                index.resource_type = resource_type
                index.save
                decidim_geo_update_components! 
              end
      
            def with_scope(decidim_geo_hash)
                return decidim_geo_hash unless scope
                decidim_geo_hash[:geo_scope_id] = scope.id
                decidim_geo_hash
            end

            def with_coords(decidim_geo_hash)
                return decidim_geo_hash unless has_coordinates?
                
                decidim_geo_hash[:latitude] = latitude
                decidim_geo_hash[:longitude] = longitude
                decidim_geo_hash
            end

            def with_no_index(decidim_geo_hash)
                if resource.class.include? Decidim::HasComponent
                    decidim_geo_hash[:avoid_index] = resource.component.decidim_geo_avoid_index?
                else
                    decidim_geo_hash[:avoid_index] = false
                end
                decidim_geo_hash
            end

            private

            def has_coordinates?
                latitude && longitude
            end

            def decidim_geo_update_components!
                return unless resource.class.include? Decidim::ScopableParticipatorySpace
                decidim_geo_linked_components.each do |child_component|
                    child_component.update_decidim_geo_index
                end
            end

            def decidim_geo_linked_components
                @decidim_geo_linked_components ||= begin
                    registry = Decidim::Geo::ManifestRegistry.instance
                    active_manifest_names = registry.active_manifests(&:keys)
                    Decidim::Component.where(
                        participatory_space_id: resource.id,
                        participatory_space_type: resource.class.name,
                        manifest_name: active_manifest_names
                    )
                end
            end

        end
    end
end