# frozen_string_literal: true

module Decidim
  module Geo
    class AutomaticScopeJob < ::ApplicationJob
      queue_as :default

      def perform
        # Select registred spaces
        spaces = registry.active_manifests do |registry|
          registry.select do |_manifest_name, options|
            model = options[:model]
            model.include?(Decidim::ScopableParticipatorySpace)
          end
        end
        # Select registred components manifest name
        component_options = registry.active_manifests do |registry|
          registry.select do |_manifest_name, options|
            model = options[:model]
            model.include?(Decidim::HasComponent) && model.include?(Decidim::ScopableResource)
          end
        end
        component_manifests = component_options.keys
        # Select all the components where space's scope is nil
        # and component's scope is nil, and get the component Ids.
        components_without_scopes = spaces.map do |_manifest_name, space_options|
          space_options[:model].where(scope: nil).select(:id).map do |space|
            Decidim::Component.where(
              participatory_space_type: space_options[:model].name,
              participatory_space_id: space.id,
              manifest_name: component_manifests
            ).to_a.reject do |component|
              component.settings.scope_id
            end
          end.flatten
        end.flatten
        # loop over all the resources that have no scopes
        component_options.map do |_manifest_name, options|
          model = options[:model]
          model.where(component: components_without_scopes, scope: nil).map do |resource|
            lat = latitude(resource)
            lon = longitude(resource)
            next unless lat && lon

            point_coord = RGeo::Geographic.spherical_factory(srid: 2056).point(lon, lat)
            shape = Decidim::Geo::Shapedata.where("ST_Contains(geom, ?)", point_coord).first
            next unless shape

            assigned_scope = Decidim::Scope.where(shapedata: shape).first
            next unless assigned_scope

            resource.update(scope: assigned_scope)
          end
        end
      end

      private

      def latitude(resource)
        if location_overriden?(resource)
          location(resource).latitude if location(resource) && location(resource).latitude
        elsif resource.respond_to?(:latitude)
          resource.latitude
        end
      end

      def longitude(resource)
        if location_overriden?(resource)
          location(resource).longitude if location(resource) && location(resource).longitude
        elsif resource.respond_to?(:longitude)
          resource.longitude
        end
      end

      def location(resource)
        resource.decidim_geo_space_location
      end

      def location_overriden?(resource)
        resource.respond_to?(:decidim_geo_space_location)
      end

      def registry
        @registry ||= Decidim::Geo::ManifestRegistry.instance
      end
    end
  end
end
