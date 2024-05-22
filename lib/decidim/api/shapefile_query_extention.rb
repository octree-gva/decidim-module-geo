# frozen_string_literal: true

module Decidim
  module Geo
    module ShapefileQueryExtension
      # Public: Extends a type with `decidim-geo`'s fields.
      #
      # type - A GraphQL::BaseType to extend.
      #
      # Returns nothing.
      def self.included(type)
        type.field :shapefiles, [Decidim::Geo::ShapefileType],
                   description: "Return's information about the shapefiles", null: true
      end

      def shapefiles
        Decidim::Geo::Shapefile.all
      end
    end
  end
end
