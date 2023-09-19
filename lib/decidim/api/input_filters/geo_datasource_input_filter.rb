# frozen_string_literal: true

module Decidim
  module Geo
    class GeoDatasourceInputFilter < Decidim::Core::BaseInputFilter
      include Decidim::Geo::HasScopeableInputFilter
    
      graphql_name "GeoDatasourceFilter"
      description "A type used for filtering geo datasources"

      argument :term,
                type: String,
                description: "List results by Term",
                required: false

      argument :resource_type,
                type: [String],
                description: "List results by Resource Type",
                required: false

      argument :scope_id,
                type: ID,
                description: "List results by scope_id",
                required: false
    end
  end
end
