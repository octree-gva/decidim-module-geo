# frozen_string_literal: true

require "decidim/geo"

namespace :geo do
  desc """
    Execute SHP2PSQL for upload shapefiles to postgis
  """

  desc "Load shapefile to database"
  task :shp_loader, [:shapefile] => :environment do |t, args|
    
    Rails.logger.info "⚙️ voca:backup done. (#{backup_file_encrypted})"
  end
end
