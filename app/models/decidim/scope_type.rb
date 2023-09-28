# frozen_string_literal: true

module Decidim
  # Scope types allows to use different types of scopes in participatory process
  # (municipalities, provinces, states, countries, etc.)
  # Override to include shapefiles field
  class ScopeType < ApplicationRecord
    include Decidim::TranslatableResource

    translatable_fields :name, :plural
    belongs_to :organization,
               foreign_key: "decidim_organization_id",
               class_name: "Decidim::Organization",
               inverse_of: :scope_types

    has_one :shapefile, 
            class_name: "Decidim::Geo::Shapefile", 
            inverse_of: :scope_type, 
            foreign_key: "decidim_scope_types_id", 
            dependent: :nullify

    has_many :scopes, class_name: "Decidim::Scope", inverse_of: :scope_type, dependent: :nullify

    validates :name, presence: true
  end
end
