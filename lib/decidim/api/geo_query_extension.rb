module Decidim
  module Geo
    # GeoQueryExtension
    module GeoQueryExtension
      def self.included(type)
        type.field :geo_shapefiles, [Decidim::Geo::GeoShapefileType], description: "Return's information about the shapefiles", null: true do
          argument :title, [String], required: false
        end

        type.field :geo_shapedata, [Decidim::Geo::GeoShapedataType], description: "Return's datas from shapefile", null: true do
          argument :name, [String], required: false
        end

        type.field :geo_config, Decidim::Geo::GeoConfigType, description: "Return's information about the geo config", null: true

        type.field :geo_scope, [Decidim::Geo::GeoScopeApiType], description: "Return's scopes with shapedatas", null: true do
          argument :name, [String], required: false
        end

        
      end

      def geo_shapefiles(title: nil)
        return Decidim::Geo::Shapefile.where(title: title) if title.present?

        Decidim::Geo::Shapefile.all
      end

      def geo_shapedata(name: nil)
        return Decidim::Geo::Shapedata.where("data->>'NAME' in (?)", name) if name.present?

        Decidim::Geo::Shapedata.all
      end

      def geo_config
        Decidim::ContentBlock.where(manifest_name: 'geo_maps').take.settings
      end

      def geo_scope(name: nil)
        return Decidim::Scope.where("name->>'#{organization_locale}' in (?)", name) if name.present?

        Decidim::Scope.all
      end

      private

      def organization_locale
        given_organization ||= try(:current_organization)
        given_organization ||= try(:organization)
        given_organization.try(:default_locale)
      end


    end
  end
end
