# frozen_string_literal: true

module Decidim
  module Geo
    class GeoencodedInputFilter < Decidim::Core::BaseInputFilter
    
      graphql_name "GeoencodedFilter"
      description "A type used for filtering geo datasources if they are geoencoded"

      argument :geoencoded, type: Boolean, description: "List results by time", required: true
    end
  end
end
