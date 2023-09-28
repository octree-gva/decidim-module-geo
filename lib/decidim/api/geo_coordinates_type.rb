# frozen_string_literal: true

module Decidim
  module Geo
    # This type represents a Decidim's global property.
    class GeoCoordinatesType < Decidim::Api::Types::BaseObject
      description "Physical coordinates for a location"

      field :latitude, GraphQL::Types::Float, "Latitude of this coordinate", null: true
      field :longitude, GraphQL::Types::Float, "Longitude of this coordinate", null: true
      field :geom, GraphQL::Types::JSON, "Shapedata for this object", null: true

      def latitude
        object[0]
      end

      def longitude
        object[1]
      end

      def geom
        object[2]
      end

    end
  end
end