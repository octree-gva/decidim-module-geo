# frozen_string_literal: true

module Decidim
  module Geo
    class GeoDatasourceInputFilter < Decidim::Core::BaseInputFilter
      include Decidim::Geo::HasTermableInputFilter
      include Decidim::Geo::HasScopeableInputFilter
    
      graphql_name "GeoDatasourceFilter"
      description "A type used for filtering geo datasources"

    end
  end
end
