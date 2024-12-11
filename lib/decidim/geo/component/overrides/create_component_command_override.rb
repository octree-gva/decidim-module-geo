# frozen_string_literal: true

module Decidim
  module Geo
    module CreateComponentCommandOverride
      extend ActiveSupport::Concern
      included do
        alias_method :decidim_original_create_component, :create_component

        private

        def create_component
          new_component = decidim_original_create_component
          avoid_index_relation = new_component.decidim_geo_avoid_index || Decidim::Geo::NoIndex.new
          avoid_index_relation.decidim_component_id = new_component.id
          avoid_index_relation.no_index = form.decidim_geo_avoid_index
          new_component.decidim_geo_avoid_index = avoid_index_relation
          @component = new_component.save
        end
      end
    end
  end
end
