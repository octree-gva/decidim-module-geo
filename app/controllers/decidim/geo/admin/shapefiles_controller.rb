# frozen_string_literal: true

module Decidim
  module Geo
    module Admin
      class ShapefilesController < Decidim::Geo::Admin::ApplicationController

        before_action :authenticate_user!
        
        def index
          #enforce_permission_to :list
          @shapefiles = Decidim::Geo::Shapefile.all
        end

        def new
          enforce_permission_to :new, :shapefile
          @form = Decidim::Geo::Admin::ShapefileForm.new
        end

        def create
          enforce_permission_to :create, :shapefile
          @form = form(Decidim::Geo::Admin::ShapefileForm).from_params(params)

          Admin::CreateShapefile.call(@form) do
            on(:ok) do
              flash[:notice] = I18n.t("shapefiles.actions.create.success", scope: "decidim.geo.admin")
              redirect_to shapefiles_path
            end

            on(:invalid) do
              flash.now[:alert] = @form.errors.full_messages_for(:base).join(',')
              render action: "new"
            end
          end
        end

      end
    end
  end
end
