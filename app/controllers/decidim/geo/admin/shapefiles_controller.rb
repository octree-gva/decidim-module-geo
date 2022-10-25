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
        
        def uploader
          @uploader ||= Decidim::Geo::ShapefileUploader.new(current_organization, :shapefile)
        end
      end
    end
  end
end
