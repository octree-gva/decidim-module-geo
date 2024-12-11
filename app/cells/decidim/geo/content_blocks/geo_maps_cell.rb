# frozen_string_literal: true

module Decidim
  module Geo
    module ContentBlocks
      class GeoMapsCell < Decidim::ViewModel
        delegate :decidim_page_title, to: :view_context
        include Decidim::SanitizeHelper
        include Decidim::LayoutHelper
        def show
          return "<!-- DecidimGeo: Map is empty -->".html_safe if hide_empty? && empty_map?

          render
        end

        private

        def hide_empty?
          @options[:hide_empty] || false
        end

        def empty_map?
          data_count < 1
        end

        def data_count
          @data_count ||= ::Decidim::Geo::Api::GeoQuery.new(
            current_organization,
            current_user,
            { filters: filters, is_index: index?, is_group: group? },
            current_locale
          ).results_count
        end

        def filters
          @options[:filters] || []
        end

        def insert_map
          id = @options[:id] || "HomePage"
          config = {
            locale: current_locale,
            default_locale: default_locale,
            space_ids: @options[:scopes] || [],
            selected_component: current_component_id || nil,
            selected_point: current_component? && params[:id] ? params[:id] : nil,
            images: {
              not_geolocated: ActionController::Base.helpers.asset_pack_path("media/images/not-geolocated.svg")
            },
            filters: (@options[:filters] || []).concat([{ timeFilter: { time: "active" } }]),
            map_config: map_config,
            active_manifests: ::Decidim::Geo.registry.active_manifests(&:keys),
            is_index: index?,
            is_group: @options[:is_group] || false,
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

        def index?
          @options.has_key?(:is_index) ? @options[:is_index] : true
        end

        def group?
          @options.has_key?(:is_group) ? @options[:is_group] : false
        end

        def insert_scopes_mobile
          content_tag(:div, "", class: ["js-decidimgeo"])
        end

        def geo_i18n
          supported_models = ::Decidim::Geo.registry.active_manifests do |manifests|
            manifests.map do |manifest_name, manifest_config|
              [manifest_name, manifest_config[:model].model_name.human]
            end
          end
          geo_i18n = supported_models.to_h
          {
            **geo_i18n,
            "decidim.geo.proposals.states": t("decidim.admin.filters.proposals.state_eq.values"),
            "decidim.geo.mobile.open_fullscreen": t("decidim.geo.mobile.open_fullscreen"),
            "decidim.geo.mobile.close_fullscreen": t("decidim.geo.mobile.close_fullscreen"),
            "decidim_geo.scopes.all": t("decidim.geo.scopes.all"),
            "decidim_geo.scopes.dropdown": t("decidim.geo.scopes.dropdown"),

            "decidim_geo.filters.results.one": t("decidim.geo.filters.results.one"),
            "decidim_geo.filters.results.zero": t("decidim.geo.filters.results.zero"),
            "decidim_geo.filters.results.warn_empty": t("decidim.geo.filters.results.warn_empty"),
            "decidim_geo.filters.results.other": t("decidim.geo.filters.results.other"),

            "decidim_geo.filters.back": t("decidim.geo.filters.back"),
            "decidim_geo.filters.button": t("decidim.geo.filters.button"),
            "decidim_geo.filters.reset_button": t("decidim.geo.filters.reset_button"),
            "decidim_geo.filters.apply_button": t("decidim.geo.filters.apply_button"),
            "decidim_geo.filters.geo.label": t("decidim.geo.filters.geo.label"),
            "decidim_geo.filters.geo.all": t("decidim.geo.filters.geo.all"),
            "decidim_geo.filters.geo.geoencoded": t("decidim.geo.filters.geo.only_geoencoded"),
            "decidim_geo.filters.geo.virtual": t("decidim.geo.filters.geo.only_virtual"),
            "decidim_geo.filters.time.label": t("decidim.geo.filters.time.label"),
            "decidim_geo.filters.time.all": t("decidim.geo.filters.time.all"),
            "decidim_geo.filters.time.past": t("decidim.geo.filters.time.only_past"),
            "decidim_geo.filters.time.active": t("decidim.geo.filters.time.only_active"),
            "decidim_geo.filters.time.future": t("decidim.geo.filters.time.only_future"),
            "decidim_geo.filters.type.label": t("decidim.geo.filters.type.label"),
            "decidim_geo.filters.type.all": t("decidim.geo.filters.type.all"),
            "decidim_geo.filters.type.participatory_processes": t("decidim.geo.filters.type.only_processes"),
            "decidim_geo.filters.type.assemblies": t("decidim.geo.filters.type.only_assemblies"),
            "decidim_geo.filters.type.proposals": t("decidim.geo.filters.type.only_proposals"),
            "decidim_geo.filters.type.meetings": t("decidim.geo.filters.type.only_meetings"),
            "decidim_geo.filters.type.debates": t("decidim.geo.filters.type.only_debates"),
            "decidim_geo.filters.type.accountability": t("decidim.geo.filters.type.only_accountabilities"),
            "decidim_geo.filters.empty.message": t("decidim.geo.filters.empty.message"),
            "decidim_geo.filters.empty.update_button": t("decidim.geo.filters.empty.update_button"),
            "decidim_geo.actions.view": t("decidim.geo.actions.view")
          }
        end

        def current_locale
          I18n.locale.to_s
        end

        def default_locale
          current_organization.default_locale
        end

        def current_component_id
          return "none" unless current_component

          current_component.id
        end

        def current_component
          request.env["decidim.current_component"]
        end

        def current_participatory_space
          request.env["decidim.current_participatory_space"]
        end

        def current_component?
          current_component.present?
        end

        def map_config
          {
            lat: model.try(:latitude).nil? ? config.latitude : model.latitude,
            lng: model.try(:longitude).nil? ? config.longitude : model.longitude,
            tile_layer: config.tile,
            maptiler_api_key: config.maptiler_api_key,
            maptiler_style_id: config.maptiler_style_id,
            zoom: config.zoom,
            focus_zoom_level: config.focus_zoom_level,
            force_geo_filter: config.default_geoencoded_filter
          }.to_h
        end

        def config
          @config ||= Decidim::Geo::GeoConfig.geo_config_default
        end
      end
    end
  end
end
