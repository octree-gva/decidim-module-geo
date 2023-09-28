# frozen_string_literal: true

module Decidim
  module Geo
    # GeoShapedataType
    class GeoShapedataType < Decidim::Api::Types::BaseObject
      description "A shapefile data"

      field :id, ID, null: false
      field :data, GraphQL::Types::JSON, null: true
      field :geom, GraphQL::Types::JSON, null: true

      def geom
        RGeo::GeoJSON.encode(object.geom)
      end
    end
  end
end
