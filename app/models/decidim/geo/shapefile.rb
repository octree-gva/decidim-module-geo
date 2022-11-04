# frozen_string_literal: true

module Decidim
  module Geo
    # The data store for a Proposal in the Decidim::Proposals component.
    class Shapefile < Geo::ApplicationRecord
      include Decidim::Resourceable
      include Decidim::HasComponent
      include Decidim::ScopableResource
      include Decidim::HasReference
      include Decidim::Reportable
      include Decidim::HasAttachments
      include Decidim::Searchable
      include Decidim::Traceable
      include Decidim::Loggable
      include Decidim::Fingerprintable
      include Decidim::DataPortability
      include Decidim::TranslatableResource
      include Decidim::TranslatableAttributes

      component_manifest_name "shapefiles"

      translatable_fields :title

      validates :title

    end
  end
end
