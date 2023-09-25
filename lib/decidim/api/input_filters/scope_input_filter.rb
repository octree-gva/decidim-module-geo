# frozen_string_literal: true

module Decidim
  module Geo
    class ScopeInputFilter < Decidim::Core::BaseInputFilter
    
      graphql_name "ScopeFilter"
      description "A type used for filtering geo datasources by scope"

      argument :scope_id, type: ID, description: "List results by scope_id", required: false
    end
  end
end
