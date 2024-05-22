# frozen_string_literal: true

module Decidim
  module Geo
    class GeoConfigType < Decidim::Api::Types::BaseObject
      description "A geo admin config"

      field :zoom, Float, null: false
      field :longitude, Float, null: false
      field :latitude, Float, null: false
      field :tile, String, null: true
    end
  end
end
