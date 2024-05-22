# frozen_string_literal: true

class AddPostgisExtensionToDatabase < ActiveRecord::Migration[6.0]
  def change
    enable_extension "postgis"
  end
end
