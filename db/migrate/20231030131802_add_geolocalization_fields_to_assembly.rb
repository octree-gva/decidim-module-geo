# frozen_string_literal: true

class AddGeolocalizationFieldsToAssembly < ActiveRecord::Migration[6.0]
  def change
    add_column :decidim_assemblies, :geocoding_enabled, :boolean
    add_column :decidim_assemblies, :address, :text
    add_column :decidim_assemblies, :latitude, :float
    add_column :decidim_assemblies, :longitude, :float
  end
end
