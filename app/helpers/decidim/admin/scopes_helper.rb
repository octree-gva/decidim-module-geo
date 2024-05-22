# frozen_string_literal: true

module Decidim
  module Admin
    # This module includes helpers to show scopes in admin
    module ScopesHelper
      Option = Struct.new(:id, :name)

      # Public: This helper shows the path to the given scope, linking each ancestor.
      #
      # current_scope - Scope object to show
      #
      def scope_breadcrumbs(current_scope)
        current_scope.part_of_scopes.map do |scope|
          if scope == current_scope
            translated_attribute(scope.name)
          else
            link_to translated_attribute(scope.name), scope_scopes_path(scope)
          end
        end
      end

      # Public: A formatted collection of scopes for a given organization to be used
      # in forms.
      #
      # organization - Organization object
      #
      # Returns an Array.
      def organization_scope_types(organization = current_organization)
        [Option.new("", "-")] +
          organization.scope_types.map do |scope_type|
            Option.new(scope_type.id, translated_attribute(scope_type.name))
          end
      end

      def organization_scope_depths(organization = current_organization)
        organization.scope_types.map do |scope_type|
          Option.new(scope_type.id, translated_attribute(scope_type.name))
        end.reverse
      end

      def shapedata_scope(scope)
        return nil if scope.scope_type.shapefile.nil?

        shapefile = scope.scope_type.shapefile
        shapedata = shapedata_version_compat(shapefile)

        shapedata.map do |shp|
          Option.new(shp.id, shp.data)
        end
      end

      def shapedata_name(scope)
        Decidim::Geo::Shapedata
          .select("data['NAME']")
          .find_by(id: scope.shapedata.id).data
      end

      private

      def shapedata_version_compat(shapefile)
        if Decidim.version.to_f >= 0.27
          return Decidim::Geo::Shapedata
                 .select("id", "data['NAME']")
                 .where(decidim_geo_shapefiles_id: shapefile.id).order(:data.name)
        end

        Decidim::Geo::Shapedata
          .select("id", "data['NAME']")
          .where(decidim_geo_shapefiles_id: shapefile.id).order("data['NAME'] ASC")
      end
    end
  end
end
