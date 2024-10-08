# frozen_string_literal: true

module Decidim
  module Geo
    module AccountabilityCreateCommandOverride
      extend ActiveSupport::Concern
      included do
        alias_method :decidim_original_create_result, :create_result

        private

        def create_result
          result = decidim_original_create_result
          return result unless @form.decidim_geo_has_address?

          location = result.decidim_geo_space_location || Decidim::Geo::SpaceLocation.new
          location.address = @form.decidim_geo_space_address
          location.latitude = @form.latitude
          location.longitude = @form.longitude
          result.decidim_geo_space_location = location
          result.save!
          @result = result
        end
      end
    end
  end
  end
