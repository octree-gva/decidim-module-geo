# frozen_string_literal: true

require "decidim/geo/geo_json_convert/geo_json_convert"

RGeo::Geos::CAPIMultiPolygonImpl.prepend(Decidim::Geo::GeoJsonConvert)
