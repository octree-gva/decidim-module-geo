
module Decidim
    module Geo
      # This module contains all the domain logic associated to Decidim's Geo
      # component admin panel.
        module SpaceOverride
            extend ActiveSupport::Concern
            included do
                has_one :decidim_geo_space_location, as: :decidim_geo_space, class_name: "Decidim::Geo::SpaceLocation"

            end
        end
    end
  end
  