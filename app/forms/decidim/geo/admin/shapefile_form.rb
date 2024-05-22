# frozen_string_literal: true

module Decidim
  module Geo
    module Admin
      # A form object to be used when admin users want to upload a shapefile.
      class ShapefileForm < Form
        include Decidim::HasUploadValidations

        attribute :title, String
        attribute :description, String
        attribute :shapefile

        validates :title, :description, presence: true
        validates :shapefile, passthru: { to: Decidim::Geo::Shapefile }, if: ->(form) { form.shapefile.present? }

        validates_upload :shapefile, uploader: Decidim::Geo::ShapefileUploader

        alias organization current_organization
      end
    end
  end
end
