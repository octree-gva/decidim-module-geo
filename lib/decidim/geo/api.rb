# frozen_string_literal: true

module Decidim
  module Geo
    autoload :QueryExtension, "decidim/api/query_extension"
    autoload :GeoShapefileType, "decidim/api/geo_shapefile_type"
    autoload :GeoShapedataType, "decidim/api/geo_shapedata_type"
    autoload :GeoConfigType, "decidim/api/geo_config_type"
    autoload :GeoScopeApiType, "decidim/api/geo_scope_api_type"
    autoload :HasScopeableInputFilter, "decidim/api/input_filters/has_scopeable_input_filter"
    autoload :GeoDatasourceInputFilter, "decidim/api/input_filters/geo_datasource_input_filter"
    autoload :ScopeInputFilter, "decidim/api/input_filters/scope_input_filter"
    autoload :AssemblyInputFilter, "decidim/api/input_filters/assembly_input_filter"
    autoload :ProcessInputFilter, "decidim/api/input_filters/process_input_filter"
    autoload :ResourceTypeInputFilter, "decidim/api/input_filters/resource_type_input_filter"
    autoload :TimeInputFilter, "decidim/api/input_filters/time_input_filter"
    autoload :MeetingsInputFilter, "decidim/api/meetings_input_filter"
    autoload :GeoDatasourceType, "decidim/api/geo_datasource_type"
    autoload :GeoDatasourcesType, "decidim/api/geo_datasources_type"
    autoload :GeoCoordinatesType, "decidim/api/geo_coordinates_type"
  end
end
