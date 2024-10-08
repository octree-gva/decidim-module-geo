# frozen_string_literal: true

module Decidim
  module Geo
    # Data fo the shapfiles uploaded
    class NoIndex < ApplicationRecord
      self.table_name = "decidim_geo_no_indexes"
      belongs_to :decidim_component
      def geo_indexed?
        !no_index
      end
    end
  end
  end
