class AddOrganizationToShapefiles < ActiveRecord::Migration[6.1]
  def change
    add_reference :decidim_geo_shapefiles, :decidim_organization, foreign_key: true, null: true
    remove_column :decidim_geo_shapefiles, :shapefile
  end
end
