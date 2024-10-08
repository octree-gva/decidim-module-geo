# frozen_string_literal: true

module Decidim
    module Geo
      module AccountabilityUpdateCommandOverride
        extend ActiveSupport::Concern
        included do
          alias_method :decidim_original_update_result, :update_result
  
          def update_result
            # Update the result without the location
            decidim_original_update_result
            # 
            location = result.decidim_geo_space_location || Decidim::Geo::SpaceLocation.new
            location.address = form.decidim_geo_space_address
            location.latitude = form.latitude
            location.longitude = form.longitude
            result.update!(decidim_geo_space_location: location)
          end
        end
      end
    end
  end
  