# frozen_string_literal: true
require "rgeo"
require "decidim/geo/admin"
require "decidim/geo/engine"
require "decidim/geo/api"
require "decidim/geo/admin_engine"
require "decidim/geo/component"
require 'rgeo/shapefile'
require "decidim/geo/load_shp/app_load_shp"
# require "decidim/geo/geo_json_convert/geo_json_convert"

require 'rgeo/shapefile'
require "decidim/geo/load_shp/app_load_shp"


module Decidim
  # This namespace holds the logic of the `Geo` component. This component
  # allows users to create geo in a participatory space.
  module Geo
    class Error < StandardError; end
  end
end
