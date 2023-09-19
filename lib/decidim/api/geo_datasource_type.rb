# frozen_string_literal: true

module Decidim
  module Geo
    class GeoDatasourceType < Decidim::Api::Types::BaseObject
      description "A datasource for all objects"

      field :type, String, null: false
      field :id, ID, null: false
      field :title, Decidim::Core::TranslatedFieldType, "The title for this title", null: true
      field :description, Decidim::Core::TranslatedFieldType, "The description for this description", null: true
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

      def title
        return object.title if object.class.method_defined?(:title) 
        return object.name if object.class.method_defined?(:name) 
      end

      def description
        return object.body if object.class.method_defined?(:body)
        return object.description if object.class.method_defined?(:description)
      end

      def coordinates
        [latitude, longitude, geom]
      end

      def start_time
        object.start_time if object.class.method_defined?(:start_time) 
      end

      def end_time
        object.end_time if object.class.method_defined?(:end_time)
      end

      def latitude
        object.latitude if object.class.method_defined?(:latitude)
      end

      def longitude
        object.longitude if object.class.method_defined?(:longitude)
      end

      def geom
        RGeo::GeoJSON.encode(object.shapedata.geom) if (object.class.method_defined?(:shapedata) && !object.shapedata.nil?)
      end

      def scope
        object.scope if object.class.method_defined?(:scope)
      end

    end
  end
end

