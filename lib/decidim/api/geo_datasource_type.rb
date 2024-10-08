# frozen_string_literal: true

require "active_storage"

module Decidim
  module Geo
    class GeoDatasourceType < Decidim::Api::Types::BaseObject
      description "A datasource for all decidim geo support"
     
      field :id, ID, null: false
      field :resource_id, ID, null: false
      field :resource_type, String, null: false
      field :resource_url, String, null: false
      field :component_id, ID, null: true
      field :participatory_space_id, ID, null: true
      field :participatory_space_type, String, null: true
      field :title, Decidim::Core::TranslatedFieldType, "The title for this title", null: true
      field :short_description, Decidim::Core::TranslatedFieldType, "The short description",
            null: true
      field :description_html, Decidim::Core::TranslatedFieldType, "The description", null: true
      field :image_url, String, null: true
      field :start_date, GraphQL::Types::ISO8601Date, "The date this object starts", null: true
      field :end_date, GraphQL::Types::ISO8601Date, "The date this object ends", null: true
      field :geo_scope_id, ID, null: true
      field :coordinates, Decidim::Geo::GeoCoordinatesType, "lat/long", null: true
      field :extended_data, GraphQL::Types::JSON, "metadatas", null: true
    end
  end
end
