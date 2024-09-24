# frozen_string_literal: true

module Decidim
    module Geo
      # This module contains all the domain logic associated to Decidim's Geo
      # component admin panel.
      module ComponentNoIndexAttr
        extend ActiveSupport::Concern
        included do
          has_one :decidim_geo_avoid_index, as: :decidim_component, class_name: "Decidim::Geo::NoIndex"
        end
      end
    end
  end
  