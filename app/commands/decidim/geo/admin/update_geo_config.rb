# frozen_string_literal: true

module Decidim
  module Geo
    module Admin
      # A command with all the business logic when updating a geo_config.
      class UpdateGeoConfig < Decidim::Geo::Command
        # Public: Initializes the command.
        #
        # geo_config - The geo_config to update
        # form - A form object with the params.
        def initialize(geo_config, form)
          @geo_config = geo_config
          @form = form
        end

        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid.
        # - :invalid if the form wasn't valid and we couldn't proceed.
        #
        # Returns nothing.
        def call
          return broadcast(:invalid) if form.invalid?

          @geo_config.nil? ? create_geo_config : update_geo_config
          broadcast(:ok)
        end

        private

        attr_reader :form

        def update_geo_config
          @geo_config.update(attributes)
        end

        def create_geo_config
          @geo_config = Decidim::Geo::GeoConfig.create!(attributes)
        end

        def attributes
          {
            longitude: form.longitude,
            latitude: form.latitude,
            zoom: form.zoom,
            tile: form.tile,
            maptiler_api_key: form.maptiler_api_key,
            maptiler_style_id: form.maptiler_style_id,
            only_assemblies: form.only_assemblies,
            only_processes: form.only_processes,
            focus_zoom_level: form.focus_zoom_level,
            default_geoencoded_filter: form.default_geoencoded_filter
          }
        end
      end
    end
  end
end
