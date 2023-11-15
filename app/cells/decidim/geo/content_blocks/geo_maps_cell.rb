# frozen_string_literal: true

module Decidim
  module Geo
    module ContentBlocks
      class GeoMapsCell < Decidim::ViewModel
        #delegate :current_user, to: :controller
        include Decidim::SanitizeHelper

        def show
          render unless @options.empty?
        end

        private

          def insert_map
            id = @options[:id] || "HomePage"
            config = {
              id: "#{id}", 
              locale: current_locale,
              component: controller.controller_name,
              selected_component: current_component || nil,
              filters: @options[:filters] || [],
              highlighted_scopes: @options[:scopes] || [],
              map_config: {
                lat: geo_config[:latitude],
                lng: geo_config[:longitude],
                tile_layer: geo_config[:tile],
                zoom: geo_config[:zoom]
              }
            }.with_indifferent_access

            content_tag(
              :div, 
              '',
              id: "GeoMap#{id}",
              class: [
                "js-decidimgeo", 
                "decidimgeo__map", 
                "decidimgeo__map--#{id.underscore}"
              ],
              "data-config" => config.to_json
            )
          end


          def current_locale
            I18n.locale.to_s
          end

          def current_component
            return request.env["decidim.current_component"].id if current_component?
            "none"
          end  
          def current_component?
            request.env["decidim.current_component"].present?
          end  

          def geo_config
            { 
              latitude: model.try(:latitude).nil? ? geo_config_default.latitude : model.latitude, 
              longitude: model.try(:longitude).nil? ? geo_config_default.longitude: model.longitude,
              tile: Decidim::Geo::GeoConfig.geo_config_default.tile,
              zoom: Decidim::Geo::GeoConfig.geo_config_default.zoom
            }.to_h 
          end

          def geo_config_default
            Decidim::Geo::GeoConfig.geo_config_default
          end

      end
    end
  end
end
