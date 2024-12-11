# frozen_string_literal: true

module Decidim
  module Geo
    module UpdateComponentCommandOverride
      extend ActiveSupport::Concern
      included do
        alias_method :decidim_original_update_component, :update_component

        private

        def update_component
          decidim_original_update_component

          avoid_index_relation = @component.decidim_geo_avoid_index || Decidim::Geo::NoIndex.new
          avoid_index_relation.decidim_component_id = @component.id
          avoid_index_relation.no_index = form.decidim_geo_avoid_index
          @component.decidim_geo_avoid_index = avoid_index_relation
          @component.save!
          # Update geo index linked resources
          Decidim::Geo::Index.where(
            component_id: @component.id,
            resource_type: @component.manifest_name
          ).update(avoid_index: avoid_index_relation.no_index)
        end
      end
    end
  end
end
