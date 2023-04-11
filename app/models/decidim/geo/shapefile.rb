# frozen_string_literal: true

module Decidim
  module Geo
    # The data store for a Proposal in the Decidim::Proposals component.
    class Shapefile < ApplicationRecord
      #include Decidim::TranslatableResource

      self.table_name = 'decidim_geo_shapefiles'

      has_many :shapedatas, foreign_key: "decidim_geo_shapefiles_id"

      belongs_to :scope_type, inverse_of: :shapefile, optional: true, foreign_key: "decidim_scope_types_id"

      #translatable_fields :title, :description

      validates :title, :description, :presence => true

      mount_uploader :shapefile, Decidim::Geo::ShapefileUploader
      validates_integrity_of :shapefile
      
    end
  end
end
