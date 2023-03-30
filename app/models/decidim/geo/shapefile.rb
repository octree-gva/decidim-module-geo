# frozen_string_literal: true

module Decidim
  module Geo
    # The data store for a Proposal in the Decidim::Proposals component.
    class Shapefile < ApplicationRecord
      #include Decidim::TranslatableResource

      has_many :shapedatas

      self.table_name = 'decidim_geo_shapefile'
      
      #translatable_fields :title, :description

      validates :title, :description, :presence => true

      mount_uploader :shapefile, Decidim::Geo::ShapefileUploader
      validates_integrity_of :shapefile
      
    end
  end
end
