# frozen_string_literal: true

module Decidim
  module Geo
    class Shp2pgsqlJob < ApplicationJob
      queue_as :shapefile_loader

      def perform(shapefile)
        load_shapefile = LoadShp::AppLoadShp.new(shapefile)
        load_shapefile.run!
      end
    end
  end
end
