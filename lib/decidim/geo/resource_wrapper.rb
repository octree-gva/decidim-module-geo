# frozen_string_literal: true

module Decidim
  module Geo
    class ResourceWrapper
      include Decidim::Geo::GeoIndexMethods

      def initialize(resource)
        @resource = resource
      end
    end
  end
end
