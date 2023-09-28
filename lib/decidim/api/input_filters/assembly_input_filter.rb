# frozen_string_literal: true

module Decidim
  module Geo
    class AssemblyInputFilter < Decidim::Core::BaseInputFilter
    
      graphql_name "AssemblyFilter"
      description "A type used for filtering geo datasources by Assembly"

      argument :assembly_id, type: ID, description: "List results by assembly_id", required: false
    end
  end
end
