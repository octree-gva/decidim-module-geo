# frozen_string_literal: true

require 'active_storage'

module Decidim
  module Geo
    class GeoDatasourceType < Decidim::Api::Types::BaseObject
      description "A datasource for all objects"
      include Decidim::SanitizeHelper
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
      field :link, String, null: false

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

      def link
        Decidim::ResourceLocatorPresenter.new(object).path(anchor: "DecidimGeo")
      end

      def title
        return object.title if object.respond_to?(:title) 
        return object.name if object.respond_to?(:name) 
      end

      def short_description
        return object.short_description if object.respond_to?(:short_description)
        return truncate_translated(object.body, 250) if object.respond_to?(:body)
        return truncate_translated(object.description, 250) if object.respond_to?(:description)
      end

      def description
        return truncate_translated(object.body) if object.respond_to?(:body)
        return truncate_translated(object.description) if object.respond_to?(:description)
      end

      def truncate_translated(value, chars=2800) 
        value.each do |key, v| 
          if v.is_a?(Hash) 
            value[key] = truncate_translated(v, chars)
          else
            value[key] = Decidim::ContentProcessor.render_without_format(Decidim::HtmlTruncation.new(v, max_length: 2800,tail: "…",count_tags: false,count_tail: false,tail_before_final_tag: false).perform)
          end
        end
        value
      end

      def banner_image
        return object.attached_uploader(:banner_image).url(only_path: true) if object.respond_to?(:banner_image)
        return object.attachments.first.url if object.respond_to?(:attachments) && object.attachments.first
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
        object.scope if object.respond_to?(:scope)
      end

      def has_coordinates?
        if object.respond_to?(:latitude) && object.respond_to?(:longitude)
          object.latitude.present? && object.longitude.present?
        end
      end

    end
  end
end

