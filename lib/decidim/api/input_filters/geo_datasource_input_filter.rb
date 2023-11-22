# frozen_string_literal: true

module Decidim
  module Geo
    class GeoDatasourceInputFilter < Decidim::Core::BaseInputFilter
    
      graphql_name "GeoDatasourceFilter"
      description "A type used for filtering geo datasources"

      argument :assembly_filter, Decidim::Geo::AssemblyInputFilter, description: "List results by Assembly", required: false
      argument :process_filter, Decidim::Geo::ProcessInputFilter, description: "List results by ParticipatoryProcess", required: false
      argument :not_scope_filter, Decidim::Geo::NotScopeInputFilter, description: "Exclude results that have given scope", required: false
      argument :scope_filter, Decidim::Geo::ScopeInputFilter, description: "List results by Scope", required: false
      argument :term_filter, Decidim::Geo::TermInputFilter, description: "List results by Term", required: false
      argument :resource_type_filter, Decidim::Geo::ResourceTypeInputFilter, description: "List results by Resource Type", required: false
      argument :process_group_filter, Decidim::Geo::ProcessGroupInputFilter, description: "List results by ProcessGroup", required: false
    end
  end
end
