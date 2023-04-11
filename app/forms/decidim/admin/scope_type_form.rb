# frozen_string_literal: true

module Decidim
  module Admin
    # A form object to create or update scopes.
    class ScopeTypeForm < Form
      include TranslatableAttributes

      translatable_attribute :name, String
      translatable_attribute :plural, String
      attribute :organization, Decidim::Organization

      attribute :shapefile, Decidim::Geo::Shapefile

      mimic :scope_type

      validates :name, :plural, translatable_presence: true
      validates :organization, presence: true

      alias organization current_organization

      def map_model(model)
        self.shapefile = model.shapefile.id unless model.shapefile.nil?
      end
    end
  end
end
