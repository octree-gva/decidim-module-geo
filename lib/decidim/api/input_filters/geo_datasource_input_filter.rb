# frozen_string_literal: true

module Decidim
  module Geo
    class GeoDatasourceInputFilter < Decidim::Core::BaseInputFilter
      graphql_name "GeoDatasourceFilter"
      description "A type used for filtering geo datasources"

      argument :assembly_filter, Decidim::Geo::AssemblyInputFilter, description: "List results by Assembly",
                                                                    required: false
      argument :process_filter, Decidim::Geo::ProcessInputFilter, description: "List results by ParticipatoryProcess",
                                                                  required: false
      argument :scope_filter, Decidim::Geo::ScopeInputFilter, description: "List results by Scope", required: false
      argument :resource_type_filter, Decidim::Geo::ResourceTypeInputFilter,
               description: "List results by Resource Type", required: false
      argument :time_filter, type: Decidim::Geo::TimeInputFilter, description: "List results by time", required: false
      argument :geoencoded_filter, type: Decidim::Geo::GeoencodedInputFilter,
                                   description: "List results if they are geoencoded", required: false
    end
  end
end
