# frozen_string_literal: true

require "rgeo"
require "decidim/decidim_geo/admin"
require "decidim/decidim_geo/engine"
require "decidim/decidim_geo/api"
require "decidim/decidim_geo/admin_engine"
require "rgeo/shapefile"
require "decidim/decidim_geo/load_shp/app_load_shp"
require "decidim/decidim_geo/space_location/space_override"
require "decidim/decidim_geo/space_location/assembly_form_override"
require "decidim/decidim_geo/space_location/assembly_create_command_override"
require "decidim/decidim_geo/space_location/assembly_update_command_override"
require "decidim/decidim_geo/space_location/participatory_process_command_override"
require "decidim/decidim_geo/space_location/participatory_process_form_override"

module Decidim
  # This namespace holds the logic of the `Geo` component. This component
  # allows users to create geo in a participatory space.
  module Geo
    class Error < StandardError; end
  end
end
