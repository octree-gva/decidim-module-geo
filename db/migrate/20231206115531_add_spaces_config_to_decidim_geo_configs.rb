class AddSpacesConfigToDecidimGeoConfigs < ActiveRecord::Migration[6.1]
  def change
    add_column :decidim_geo_configs, :only_processes, :boolean, default: false, null: false
    add_column :decidim_geo_configs, :only_assemblies, :boolean, default: false, null: false
  end
end
