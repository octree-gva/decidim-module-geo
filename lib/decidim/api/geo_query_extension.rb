module Decidim
  module Geo
    # GeoQueryExtension
    module GeoQueryExtension
      def self.included(type)
        type.field :geo_shapefiles, [Decidim::Geo::GeoShapefileType], description: "Return's information about the shapefiles", null: true do
          argument :title, [String], required: false
        end

        type.field :geo_shapedata, [Decidim::Geo::GeoShapedataType], description: "Return's information about the first data", null: true do
          argument :name, [String], required: false
        end

        type.field :geo_config, Decidim::Geo::GeoConfigType, description: "Return's information about the geo config", null: true
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

      private

      def execute_query(sql)
        shapedata = Decidim::Geo::Shapedata.new
        results = shapedata.execute_statement(sql)
        results.as_json if results.values.present?
      end
    end
  end
end
