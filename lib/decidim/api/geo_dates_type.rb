# frozen_string_literal: true

module Decidim
  module Geo
    class GeoDatesType < Decidim::Api::Types::BaseObject

      description "A geo content block config"

      field :zoom, Integer, null: false
      field :lng, Integer, null: false
      field :lat, Integer, null: false
      
    end
  end
end