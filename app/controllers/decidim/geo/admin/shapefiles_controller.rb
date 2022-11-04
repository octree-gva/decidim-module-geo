# frozen_string_literal: true

module Decidim
  module Geo
    module Admin
      class ShapefilesController < Decidim::Geo::Admin::ApplicationController
        
        def index
          #enforce_permission_to :list
        end

        def new
          # enforce_permission_to :create, :shapefile
          @form = form(Decidim::Geo::Admin::ShapefileForm).from_params(
            attachment: form(AttachmentForm).from_params({})
          )
        end

        def create
          #enforce_permission_to :create, :shapefile
          @form = form(Decidim::Geo::Admin::ShapefileForm).from_params(params)

          Admin::CreateProposal.call(@form) do
            on(:ok) do
              flash[:notice] = I18n.t("proposals.create.success", scope: "decidim.proposals.admin")
              redirect_to proposals_path
            end

            on(:invalid) do
              flash.now[:alert] = I18n.t("proposals.create.invalid", scope: "decidim.proposals.admin")
              render action: "new"
            end
          end
        end

      end
    end
  end
end
