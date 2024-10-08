# frozen_string_literal: true

module Decidim
    module Geo
      module ComponentFormOverride
        extend ActiveSupport::Concern
        included do
          alias_method :decidim_original_map_model, :map_model
          attribute :decidim_geo_avoid_index, ActiveModel::Type::Boolean
  
          def map_model(model)
            decidim_original_map_model(model)
            no_index = model.decidim_geo_avoid_index || Decidim::Geo::NoIndex.new
            self.decidim_geo_avoid_index = no_index.no_index
          end
  
        end
      end
    end
  end
  