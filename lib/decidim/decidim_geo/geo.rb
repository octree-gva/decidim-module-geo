# frozen_string_literal: true

module Decidim
  module Geo
    include ActiveSupport::Configurable

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
    autoload :GeoencodedInputFilter, "decidim/api/input_filters/geoencoded_input_filter"
    autoload :MeetingsInputFilter, "decidim/api/meetings_input_filter"
    autoload :GeoDatasourceType, "decidim/api/geo_datasource_type"
    autoload :GeoDatasourcesType, "decidim/api/geo_datasources_type"
    autoload :GeoCoordinatesType, "decidim/api/geo_coordinates_type"

    ##
    # Active model filters for the API.
    config_accessor :supported_filters do
      [
        "Decidim::Geo::Api::ProcessFilter",
        "Decidim::Geo::Api::AssemblyFilter",
        "Decidim::Geo::Api::ProposalFilter",
        "Decidim::Geo::Api::DebateFilter",
        "Decidim::Geo::Api::MeetingFilter",
        "Decidim::Geo::Api::AccountabilityFilter",
      ]
    end
    
    def self.supported_filters
      ::Decidim::Geo.config.supported_filters.map do |filter|
        filter.constantize
      end
    end

    def self.supported_filter_models
      self.supported_filters.map do |filter|
        filter.model_klass.constantize
      end
    end

    config_accessor :experimental_features do
      # By default enable experimental feature while developping
      ENV.fetch("RAILS_ENV", "production") == "development"
    end
  end
end
