# frozen_string_literal: true

module Decidim
  module Geo
    module Admin
      class GeoConfigsController < Decidim::Geo::Admin::ApplicationController
        layout "decidim/decidim_geo/admin/application"

        before_action :authenticate_user!

        def index
          @form = form(Decidim::Geo::Admin::GeoConfigForm).from_model(geo_config_default)
        end

        def create
          update
        end

        def update
          @form = form(Decidim::Geo::Admin::GeoConfigForm).from_params(params)

          Admin::UpdateGeoConfig.call(geo_config_default, @form) do
            on(:ok) do
              flash[:notice] = I18n.t("geo_configs.actions.update.success", scope: "decidim.geo.admin")
            end

            on(:invalid) do
              flash.now[:alert] = @form.errors.full_messages_for(:base).join(",")
            end

            render action: "index"
          end
        end

        private

        def geo_config_default
          Decidim::Geo::GeoConfig.geo_config_default
        end
      end
    end
  end
end
