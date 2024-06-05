# frozen_string_literal: true

module Decidim
  module Geo
    module ContentBlocks
      class GeoMapsCell < Decidim::ViewModel
        # delegate :current_user, to: :controller
        include Decidim::SanitizeHelper

        def show
          return "<!-- DecidimGeo: Map is empty -->".html_safe if hide_empty? && empty_map?

          render
        end

        private
        def hide_empty?
          @options[:hide_empty] || false
        end

        def hide_empty?
          @options[:hide_empty] || false
        end

        def empty_map?
          data_count <= 1
        end

        def data_count
          @data_count ||= ::Decidim::Geo::Api::GeoQuery.new(current_organization, current_user, filters, current_locale).results_count
        end

        def filters
          @options[:filters] || []
        end

        def insert_map
          id = @options[:id] || "HomePage"
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
            "",
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
          supported_models = ::Decidim::Geo.config.supported_filters.map do |filter|
            filter.constantize.new(self).klass
          end
          geo_i18n = supported_models.to_h { |klass| [klass.name, klass.model_name.human] }
          geo_i18n = {
            **geo_i18n,
            "decidim_geo.scopes.all": t("decidim.geo.scopes.all"),
            "decidim_geo.scopes.dropdown": t("decidim.geo.scopes.dropdown"),
            "decidim_geo.filters.back": t("decidim.geo.filters.back"),
            "decidim_geo.filters.button": t("decidim.geo.filters.button"),
            "decidim_geo.filters.reset_button": t("decidim.geo.filters.reset_button"),
            "decidim_geo.filters.apply_button": t("decidim.geo.filters.apply_button"),
            "decidim_geo.filters.geo.label": t("decidim.geo.filters.geo.label"),
            "decidim_geo.filters.geo.all": t("decidim.geo.filters.geo.all"),
            "decidim_geo.filters.geo.only_geoencoded": t("decidim.geo.filters.geo.only_geoencoded"),
            "decidim_geo.filters.geo.only_virtual": t("decidim.geo.filters.geo.only_virtual"),
            "decidim_geo.filters.time.label": t("decidim.geo.filters.time.label"),
            "decidim_geo.filters.time.all": t("decidim.geo.filters.time.all"),
            "decidim_geo.filters.time.only_past": t("decidim.geo.filters.time.only_past"),
            "decidim_geo.filters.time.only_active": t("decidim.geo.filters.time.only_active"),
            "decidim_geo.filters.time.only_future": t("decidim.geo.filters.time.only_future"),
            "decidim_geo.filters.type.label": t("decidim.geo.filters.type.label"),
            "decidim_geo.filters.type.all": t("decidim.geo.filters.type.all"),
            "decidim_geo.filters.type.only_processes": t("decidim.geo.filters.type.only_processes"),
            "decidim_geo.filters.type.only_assemblies": t("decidim.geo.filters.type.only_assemblies"),
            "decidim_geo.filters.type.only_proposals": t("decidim.geo.filters.type.only_proposals"),
            "decidim_geo.filters.type.only_meetings": t("decidim.geo.filters.type.only_meetings")

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
            longitude: model.try(:longitude).nil? ? geo_config_default.longitude : model.longitude,
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
