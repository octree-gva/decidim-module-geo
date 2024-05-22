# frozen_string_literal: true

module Decidim
  module Geo
    class ProcessInputFilter < Decidim::Core::BaseInputFilter
      graphql_name "ProcessFilter"
      description "A type used for filtering geo datasources by Participatory Process"

      argument :id, type: ID, description: "List results by process_id", required: false
    end
  end
end
