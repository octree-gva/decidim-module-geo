# frozen_string_literal: true

module Decidim
  module Geo
    # GeoJsonConvert
    module GeoJsonConvert
      def as_geojson
        geojson = RGeo::GeoJSON.encode(self)
        geojson
      end
    end
  end
end
