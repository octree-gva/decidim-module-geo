# frozen_string_literal: true

module Decidim
  module Geo
    # The data store for geo configuration default.
    class GeoConfig < ApplicationRecord
      self.table_name = "decidim_geo_configs"
      enum default_geoencoded_filter: { force_geoencoded: 0, no_force_geoencoded: 1 }
      validates :longitude, :latitude, :zoom, presence: true

      def self.geo_config_default
        Decidim::Geo::GeoConfig
          .first_or_create(latitude: 0,
                           longitude: 0,
                           zoom: 13,
                           tile: tile_layer_default,
                           maptiler_api_key: "",
                           maptiler_style_id: "",
                           default_geoencoded_filter: 1)
      end

      def self.tile_layer_default
        return "" if Decidim.config.maps.blank?

        Decidim.config.maps.dig(:dynamic, :tile_layer, :url) || ""
      end
    end
  end
end
