# frozen_string_literal: true

module Decidim
  module Geo
    class TermInputFilter < Decidim::Core::BaseInputFilter
    
      graphql_name "TermFilter"
      description "A type used for filtering geo datasources by Term"

      argument :term, type: String, description: "List results by term", required: false
      argument :space_state, type: String, description: "List results by with_scope_state", required: false
      argument :scope_ids, type: [ID], description: "List results by scope_ids", required: false
      argument :resource_type, type: String, description: "List results by type", required: false
    end
  end
end
