# frozen_string_literal: true

require 'active_storage'

module Decidim
  module Geo
    class GeoDatasourceType < Decidim::Api::Types::BaseObject
      description "A datasource for all objects"

      field :type, String, null: false
      field :id, ID, null: false
      field :component_id, ID, null: true
      field :participatory_space_id, ID, null: true
      field :participatory_space_type, String, null: true
      field :title, Decidim::Core::TranslatedFieldType, "The title for this title", null: true
      field :short_description, Decidim::Core::TranslatedFieldType, "The short description for this short description", null: true
      field :description, Decidim::Core::TranslatedFieldType, "The description for this description", null: true
      field :banner_image, String, null: true
      field :coordinates, Decidim::Geo::GeoCoordinatesType, "Physical coordinates for this object", null: true
      field :start_time, Decidim::Core::DateTimeType, "The time this object starts", null: true
      field :end_time, Decidim::Core::DateTimeType, "The time this object ends", null: true
      field :scope, Decidim::Core::ScopeApiType, null: true

      def type
        object.class.name
      end

      def id
        object.id 
      end

      def component_id
        object.component.id if object.respond_to?(:component) 
      end

      def participatory_space_id
        return object.component.participatory_space_id if object.respond_to?(:component) 
      end

      def participatory_space_type
        return object.component.participatory_space_type if object.respond_to?(:component) 
      end

      def title
        return object.title if object.respond_to?(:title) 
        return object.name if object.respond_to?(:name) 
      end

      def short_description
        return object.short_description if object.respond_to?(:short_description)
      end

      def description
        return object.body if object.respond_to?(:body)
        return object.description if object.respond_to?(:description)
      end

      def banner_image
        return object.attached_uploader(:banner_image).url(only_path: true) if object.respond_to?(:banner_image)
      end

      def coordinates
        {latitude: latitude, longitude: longitude} if has_coordinates?
      end

      def start_time
        object.start_time if object.respond_to?(:start_time) 
      end

      def end_time
        object.end_time if object.respond_to?(:end_time)
      end

      def latitude
        object.latitude
      end

      def longitude
        object.longitude
      end

      def geom
        RGeo::GeoJSON.encode(object.shapedata.geom) if (object.respond_to?(:shapedata) && !object.shapedata.nil?)
      end

      def scope
        unless has_coordinates?
          object.scope if object.respond_to?(:scope)
        end
      end

      def has_coordinates?
        if object.respond_to?(:latitude) && object.respond_to?(:longitude)
          object.latitude.present? && object.longitude.present?
        end
      end

    end
  end
end

