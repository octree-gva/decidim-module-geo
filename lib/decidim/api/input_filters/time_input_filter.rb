# frozen_string_literal: true

module Decidim
  module Geo
    class TimeInputFilter < Decidim::Core::BaseInputFilter
    
      graphql_name "TimeFilter"
      description "A type used for filtering geo datasources by time: past, future, active"

      argument :time, type: ID, description: "List results by time", required: true
    end
  end
end
