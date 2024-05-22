# frozen_string_literal: true

module Decidim
  module Geo
    module AssemblyFormOverride
      extend ActiveSupport::Concern
      included do
        alias_method :decidim_original_map_model, :map_model
        attribute :latitude, ActiveModel::Type::Float
        attribute :longitude, ActiveModel::Type::Float

        attribute :decidim_geo_space_address, ActiveModel::Type::String
        validates :decidim_geo_space_address, geocoding: true, if: ->(form) { form.decidim_geo_has_address? }

        def map_model(model)
          decidim_original_map_model(model)
          location = model.decidim_geo_space_location || Decidim::Geo::SpaceLocation.new
          self.decidim_geo_space_address = location.address
        end

        def geocoding_enabled?
          Decidim::Map.available?(:geocoding)
        end

        def geocoded?
          latitude.present? && longitude.present?
        end

        def decidim_geo_has_address?
          decidim_geo_space_address.present?
        end
      end
    end
  end
end
