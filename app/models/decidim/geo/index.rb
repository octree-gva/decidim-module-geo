# frozen_string_literal: true

module Decidim
  module Geo
    class Index < ApplicationRecord
      self.table_name = "decidim_geo_indexes"
      # attribute :lonlat, :st_point, srid: 4326, geographic: true

      scope :indexed, -> { where(avoid_index: [false, nil]) }
      scope :geolocated, -> { where.not(lonlat: nil) }
      scope :virtual, -> { where(lonlat: nil) }
      scope :components, -> { where.not(component_id: nil) }
      scope :participatory_spaces, -> { where(component_id: nil) }

      def coordinates
        @coordinates ||= if lonlat && !lonlat.x.nan? && !lonlat.y.nan?
                           {
                             longitude: lonlat.x,
                             latitude: lonlat.y
                           }
                         end
      end
    end
  end
end
