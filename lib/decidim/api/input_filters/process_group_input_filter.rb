# frozen_string_literal: true

module Decidim
  module Geo
    class ProcessGroupInputFilter < Decidim::Core::BaseInputFilter
    
      graphql_name "ProcessGroupFilter"
      description "A type used for filtering geo datasources by Process Group"

      argument :process_group_id, type: ID, description: "List results by process_group_id", required: false
    end
  end
end
