# frozen_string_literal: true

module Decidim
  module Geo
    # Data fo the shapfiles uploaded
    class Shapedata < ApplicationRecord
      self.table_name = 'decidim_geo_shapefile_data'
      validates :data, :presence => true

      def execute_statement(sql)
        Shapedata.connection.exec_query(sql)
      end
    end
  end
end
