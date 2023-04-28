# frozen_string_literal: true

module Decidim
  module Geo
    autoload :GeoQueryExtension, "decidim/api/geo_query_extension"
    autoload :GeoShapefileType, "decidim/api/geo_shapefile_type"
    autoload :GeoShapedataType, "decidim/api/geo_shapedata_type"
    autoload :GeoConfigType, "decidim/api/geo_config_type"
    autoload :GeoScopeApiType, "decidim/api/geo_scope_api_type"
    autoload :HasScopeableInputFilter, "decidim/api/input_filters/has_scopeable_input_filter"
    autoload :MeetingsInputFilter, "decidim/api/meetings_input_filter"
  end
end
