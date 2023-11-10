# frozen_string_literal: true

class AddGeolocalizationFieldsToProcess < ActiveRecord::Migration[6.0]
  def change
    add_column :decidim_participatory_processes, :geocoding_enabled, :boolean
    add_column :decidim_participatory_processes, :address, :text
    add_column :decidim_participatory_processes, :latitude, :float
    add_column :decidim_participatory_processes, :longitude, :float
  end
end
