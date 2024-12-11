# frozen_string_literal: true

class AddFocusZoomLevelConfig < ActiveRecord::Migration[6.1]
  def change
    add_column :decidim_geo_configs, :focus_zoom_level, :integer, default: 21
  end
end
