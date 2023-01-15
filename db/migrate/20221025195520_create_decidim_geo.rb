class CreateDecidimGeo < ActiveRecord::Migration[6.0]
  def change
    create_table :decidim_geo_shapefile do |t|
      t.string :title, null: false
      t.string :description, null: true
      t.string :shapefile, null: false

      t.timestamps
    end

    create_table :decidim_geo_shapefile_data do |t|
      t.belongs_to :shapefile, index: true
      t.text :data
      t.multi_polygon :geom

      t.timestamps
    end  
  end
end
