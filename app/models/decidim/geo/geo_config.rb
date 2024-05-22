# frozen_string_literal: true

module Decidim
  module Geo
    # The data store for geo configuration default.
    class GeoConfig < ApplicationRecord
      self.table_name = "decidim_geo_configs"

      validates :longitude, :latitude, :zoom, presence: true

      def self.geo_config_default
        Decidim::Geo::GeoConfig
          .first_or_create(latitude: 0,
                           longitude: 0,
                           zoom: 13,
                           tile: tile_layer_default)
      end

      def self.tile_layer_default
        return "" if Decidim.config.maps.blank?

        Decidim.config.maps[:dynamic][:tile_layer][:url]
      end
    end
  end
end
