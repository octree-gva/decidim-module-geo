# frozen_string_literal: true

module Decidim
  module Geo
    class ResourceTypeInputFilter < Decidim::Core::BaseInputFilter
    
      graphql_name "ResourceTypeFilter"
      description "A type used for filtering geo datasources by Resource Type"

      argument :resource_type, type: [String], description: "List results by resource_type", required: false
      argument :resource_id, type: ID, description: "List results by resource_id", required: false
    end
  end
end
