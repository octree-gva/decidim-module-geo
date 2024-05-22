# frozen_string_literal: true

module Decidim
  module Geo
    class ShapefileType < Decidim::Api::Types::BaseObject
      description "A shapefile"

      field :id, ID, null: false
      field :title, String, null: false
      field :description, String, null: true
      field :shapefile, String, null: false
      field :created_at, GraphQL::Types::ISO8601DateTime, null: false
      field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
    end
  end
end
