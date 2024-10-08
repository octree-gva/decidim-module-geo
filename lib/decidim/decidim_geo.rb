# frozen_string_literal: true

require "rgeo"
require "rgeo/shapefile"
require "decidim/geo/manifest_registry"
require "decidim/geo/geo"
require "decidim/geo/admin"
require "decidim/geo/engine"
require "decidim/geo/api"
require "decidim/geo/admin_engine"
require "decidim/geo/shapefile_loader"
require "decidim/geo/filters/geo_query"
require "decidim/geo/filters/generic_filter"
require "decidim/geo/filters/default_filter"
require "decidim/geo/update_geo_index"
require "decidim/geo/generic_serializer"
require "decidim/geo/geo_index_methods"
require "decidim/geo/resource_wrapper"
require "decidim/geo/update_geo_component"


require "decidim/geo/component/overrides/component_no_index_attr"
require "decidim/geo/component/overrides/component_form_override"
require "decidim/geo/component/overrides/create_component_command_override"
require "decidim/geo/component/overrides/update_component_command_override"

require "decidim/geo/participatory_space/overrides/has_decidim_geo_location"

require "decidim/geo/accountability/overrides/accountability_form_override"
require "decidim/geo/accountability/overrides/accountability_update_command_override"
require "decidim/geo/accountability/overrides/accountability_create_command_override"

require "decidim/geo/assembly/overrides/assembly_form_override"
require "decidim/geo/assembly/overrides/assembly_create_command_override"
require "decidim/geo/assembly/overrides/assembly_update_command_override"

require "decidim/geo/process/overrides/participatory_process_command_override"
require "decidim/geo/process/overrides/participatory_process_form_override"

# Custom time filters
require "decidim/geo/proposal/proposal_filter"

module Decidim
  # This namespace holds the logic of the `Geo` component. This component
  # allows users to create geo in a participatory space.
  module Geo
    class Error < StandardError; end
  end
end
