# frozen_string_literal: true

module Decidim
  module Geo
    class GeoConfigType < Decidim::Api::Types::BaseObject

      description "A geo content block config"

      field :zoom, Integer, null: false
      field :lng, Integer, null: false
      field :lat, Integer, null: true
      
    end
  end
end