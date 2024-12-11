# frozen_string_literal: true

module Decidim
  module Geo
    module Admin
      # A form object to be used when admin configure default .
      class GeoConfigForm < Form
        attribute :longitude, Float
        attribute :latitude, Float
        attribute :zoom, Integer
        attribute :tile, String
        attribute :maptiler_api_key, String
        attribute :maptiler_style_id, String
        attribute :only_assemblies, Boolean
        attribute :only_processes, Boolean
        attribute :default_geoencoded_filter, Integer
        attribute :focus_zoom_level, Integer

        alias organization current_organization
      end
    end
  end
end
