# frozen_string_literal: true

module Decidim
  module Geo
    class GeoScopeApiType < Decidim::Api::Types::BaseObject
      description "A geo scope"

      field :id, ID, null: false
      field :name, Decidim::Core::TranslatedFieldType, "The graphql_name of this scope.", null: false

      field :children, [Decidim::Geo::GeoScopeApiType, { null: true }], "Descendants of this scope", null: false
      field :parent, Decidim::Geo::GeoScopeApiType, "This scope's parent scope.", null: true

      field :geom, GraphQL::Types::JSON, null: true

      def geom
        RGeo::GeoJSON.encode(object.shapedata.geom) unless object.shapedata.nil?
      end
    end
  end
end

