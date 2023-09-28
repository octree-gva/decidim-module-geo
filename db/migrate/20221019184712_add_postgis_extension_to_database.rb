class AddPostgisExtensionToDatabase < ActiveRecord::Migration[6.0]
  def change
    raise "Postgis adapter not enabled" unless ActiveRecord::Base.connection.adapter_name == "PostGIS"
    enable_extension 'postgis'
  end
end
