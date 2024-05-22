# frozen_string_literal: true

module Decidim
  module Geo
    # Data fo the shapfiles uploaded
    class Shapedata < ApplicationRecord
      self.table_name = "decidim_geo_shapefile_datas"
      validates :data, presence: true

      belongs_to :scope, inverse_of: :shapedata, optional: true, foreign_key: "decidim_scopes_id"

      def execute_statement(sql)
        Shapedata.connection.exec_query(sql)
      end

      def shapedata?
        false
      end
    end
  end
end
