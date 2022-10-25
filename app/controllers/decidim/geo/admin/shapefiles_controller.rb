# frozen_string_literal: true

module Decidim
  module Geo
    module Admin
      class ShapefilesController < Decidim::Geo::Admin::ApplicationController
        
        def index
          byebug
          #enforce_permission_to :list
        end
        
        def uploader
          @uploader ||= Decidim::Geo::ShapefileUploader.new(current_organization, :shapefile)
        end
      end
    end
  end
end
