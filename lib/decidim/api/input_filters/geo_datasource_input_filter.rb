# frozen_string_literal: true

module Decidim
  module Geo
    class GeoDatasourceInputFilter < Decidim::Core::BaseInputFilter
    
      graphql_name "GeoDatasourceFilter"
      description "A type used for filtering geo datasources"

      argument :assembly_filter, Decidim::Geo::AssemblyInputFilter, description: "List results by Assembly", required: false
      argument :process_filter, Decidim::Geo::ProcessInputFilter, description: "List results by ParticipatoryProcess", required: false
      argument :scope_filter, Decidim::Geo::ScopeInputFilter, description: "List results by Scope", required: false
      argument :term_filter, Decidim::Geo::TermInputFilter, description: "List results by Term", required: false

    end
  end
end
