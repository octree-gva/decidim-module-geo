# frozen_string_literal: true

module Decidim
  module Geo
    # Data fo the shapfiles uploaded
    class SpaceLocation < ApplicationRecord
      self.table_name = "decidim_geo_space_locations"
      belongs_to :decidim_geo_space, polymorphic: true

      def has_address?
        !latitude.nil? && !longitude.nil?
      end
    end
  end
end
