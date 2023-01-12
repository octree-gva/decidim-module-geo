# frozen_string_literal: true

module Decidim
  module Geo
    # The data store for a Proposal in the Decidim::Proposals component.
    class Shapedata < Geo::ApplicationRecord

      self.table_name = 'decidim_geo_shapefile_data'
      
      validates :data, :presence => true

      serialize :data, Hash
      
    end
  end
end
