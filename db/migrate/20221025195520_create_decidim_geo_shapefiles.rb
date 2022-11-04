class CreateDecidimGeoShapefiles < ActiveRecord::Migration[6.0]
  def change
    create_table :decidim_geo_shapefiles do |t|
      t.text :title, null: false
      t.text :table_name, null: true

      t.timestamps
    end
  end
end
