class CreateDecidimGeoShapefiles < ActiveRecord::Migration[6.0]
  def change
    create_table :decidim_geo_shapefiles do |t|
      t.string :title, null: false
      t.string :description, null: true
      t.string :table_name, null: true
      t.string :shapefile, null: false

      t.timestamps
    end
  end
end
