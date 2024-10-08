# frozen_string_literal: true

module Decidim
  module Geo
    module HasDecidimGeoLocation
      extend ActiveSupport::Concern
      included do
        # Fields are added through overrides in form.
        # See respective spaces overrides for more info.
        has_one :decidim_geo_space_location, as: :decidim_geo_space, class_name: "Decidim::Geo::SpaceLocation"
      end
    end
  end
end
