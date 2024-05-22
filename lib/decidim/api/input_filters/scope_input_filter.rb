# frozen_string_literal: true

module Decidim
  module Geo
    class ScopeInputFilter < Decidim::Core::BaseInputFilter
      graphql_name "ScopeFilter"
      description "A type used for filtering geo datasources by scope"

      argument :scope_id, type: Integer, description: "Retrieve search only on this scope", required: true
    end
  end
end
