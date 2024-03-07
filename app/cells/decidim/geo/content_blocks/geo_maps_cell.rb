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
            filters = @options[:filters] || []
            config = {
              locale: current_locale,
              space_ids: @options[:scopes] || [],
              selected_component: current_component || nil,
              selected_point: current_component? && params[:id] ? params[:id] : nil,
              images: {
                not_geolocated: ActionController::Base.helpers.asset_pack_path("media/images/not-geolocated.svg")
              },
              filters: @options[:filters] || [],
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
              id: "DecidimGeo",
              class: [
                "js-decidimgeo", 
                "decidimgeo__map", 
                "decidimgeo__map--#{id.underscore}"
              ],
              "data-config" => config.to_json,
              "data-i18n" => geo_i18n.to_json
            )
          end

          def geo_i18n
            supported_models = [
              Decidim::Meetings::Meeting, 
              Decidim::Proposals::Proposal, 
              Decidim::ParticipatoryProcess, 
              Decidim::Assembly, 
              Decidim::Debates::Debate              
            ]
            geo_i18n = supported_models.map { |klass| [klass.name, klass.model_name.human] }.to_h
            geo_i18n = {
              **geo_i18n,
              "decidim_geo.scopes.all":  t('decidim.geo.scopes.all'),
              "decidim_geo.filters.back":  t('decidim.geo.filters.back'),
              "decidim_geo.filters.button":  t('decidim.geo.filters.button')
            }
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
