# frozen_string_literal: true

module Decidim
  module Geo
    module AssemblyCreateCommandOverride
      extend ActiveSupport::Concern
      included do
        alias_method :decidim_original_assembly, :assembly

        private

        def assembly
          serialized_assembly = decidim_original_assembly
          return serialized_assembly unless form.decidim_geo_has_address?

          location = serialized_assembly.decidim_geo_space_location || Decidim::Geo::SpaceLocation.new
          location.address = form.decidim_geo_space_address
          location.latitude = form.latitude
          location.longitude = form.longitude
          serialized_assembly.decidim_geo_space_location = location
          location.save
          serialized_assembly
        end
      end
    end
  end
end
