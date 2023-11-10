module Decidim
  module Geo
    module GeoQueryExtension
      # Public: Extends a type with `decidim-geo`'s fields.
      #
      # type - A GraphQL::BaseType to extend.
      #
      # Returns nothing.
      
      def self.included(type)
        type.field :shapefiles, [Decidim::Geo::ShapefileType], description: "Return's information about the shapefiles", null: true

        type.field :geo_config, Decidim::Geo::GeoConfigType, description: "Return's information about the geo config", null: true
      end

      def shapefiles
        Decidim::Geo::Shapefile.all
      end

      def geo_config
        Decidim::Geo::GeoConfig.geo_config_default
      end
    end
  end
end