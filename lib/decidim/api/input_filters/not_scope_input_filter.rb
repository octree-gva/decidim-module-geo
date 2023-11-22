# frozen_string_literal: true

module Decidim
    module Geo
      class NotScopeInputFilter < Decidim::Core::BaseInputFilter
      
        graphql_name "NotScopeFilter"
        description "A type used for filtering geo datasources that are not in given scopes"
  
        argument :scopes_id, type: [ID], description: "scope ids to exclude", required: true
      end
    end
  end
  