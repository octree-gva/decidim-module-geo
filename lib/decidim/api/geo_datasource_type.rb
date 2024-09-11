# frozen_string_literal: true

require "active_storage"

module Decidim
  module Geo
    class GeoDatasourceType < Decidim::Api::Types::BaseObject
      description "A datasource for all decidim geo support"
      include Decidim::SanitizeHelper
      field :type, String, null: false
      field :id, ID, null: false
      field :component_id, ID, null: true
      field :participatory_space_id, ID, null: true
      field :participatory_space_type, String, null: true
      field :title, Decidim::Core::TranslatedFieldType, "The title for this title", null: true
      field :short_description, Decidim::Core::TranslatedFieldType, "The short description",
            null: true
      field :description, Decidim::Core::TranslatedFieldType, "The description", null: true
      field :banner_image, String, null: true
      field :coordinates, Decidim::Geo::GeoCoordinatesType, "Physical coordinates for this object", null: true
      field :start_time, Decidim::Core::DateTimeType, "The time this object starts", null: true
      field :end_time, Decidim::Core::DateTimeType, "The time this object ends", null: true
      field :scope, Decidim::Core::ScopeApiType, null: true
      field :link, String, null: false

      def type
        object.class.name
      end

      delegate :id, to: :object

      def component_id
        Rails.cache.fetch("#{cache_key_with_version}/component_id") do
          object.component.id if component?
        end
      end

      def participatory_space_id
        Rails.cache.fetch("#{cache_key_with_version}/participatory_space_id") do
          object.component.participatory_space_id if component?
        end
      end

      def participatory_space_type
        Rails.cache.fetch("#{cache_key_with_version}/participatory_space_type") do
          object.component.participatory_space_type if component?
        end
      end

      def link
        Rails.cache.fetch("#{cache_key_with_version}/link") do
          Decidim::ResourceLocatorPresenter.new(object).path
        end
      end

      def title
        Rails.cache.fetch("#{cache_key_with_version}/title") do
          return object.title if object.respond_to?(:title)
          return object.name if object.respond_to?(:name)
        end
      end

      def short_description
        Rails.cache.fetch("#{cache_key_with_version}/short_description") do
          return truncate_translated(object.short_description, 250) if object.respond_to?(:short_description)
          return truncate_translated(object.body, 250) if object.respond_to?(:body)
          return truncate_translated(object.description, 250) if object.respond_to?(:description)
        end
      end

      def description
        Rails.cache.fetch("#{cache_key_with_version}/description") do
          return truncate_translated(object.body) if object.respond_to?(:body)
          return truncate_translated(object.description) if object.respond_to?(:description)
        end
      end

      def truncate_translated(value, chars = 2800)
        value.each do |key, v|
          value[key] = if v.is_a?(Hash)
                         truncate_translated(v, chars)
                       else
                         Rails::Html::FullSanitizer.new.sanitize(
                           Decidim::HtmlTruncation.new(
                             Decidim::ContentProcessor.render(
                               v
                             ),
                             max_length: 2800,
                             tail: "…",
                             count_tags: false,
                             count_tail: false,
                             tail_before_final_tag: false
                           ).perform
                         ).html_safe
                       end
        end
        value
      end

      def banner_image
        Rails.cache.fetch("#{cache_key_with_version}/banner_image") do
          return object.attached_uploader(:banner_image).url(only_path: true) if object.respond_to?(:banner_image)
          return object.attachments.first.url if object.respond_to?(:attachments) && object.attachments.first
        end
      end

      def coordinates
        Rails.cache.fetch("#{cache_key_with_version}/coordinates") do
          { latitude: latitude, longitude: longitude } if has_coordinates?
        end
      end

      def start_time
        Rails.cache.fetch("#{cache_key_with_version}/start_time") do
          object.start_time if object.respond_to?(:start_time)
        end
      end

      def end_time
        Rails.cache.fetch("#{cache_key_with_version}/end_time") do
          object.end_time if object.respond_to?(:end_time)
        end
      end

      def latitude
        Rails.cache.fetch("#{cache_key_with_version}/latitude") do
          if has_geo_location?
            location.latitude
          else
            object.latitude
          end
        end
      end

      def longitude
        Rails.cache.fetch("#{cache_key_with_version}/longitude") do
          if has_geo_location?
            location.longitude
          else
            object.longitude
          end
        end
      end

      def geom
        Rails.cache.fetch("#{cache_key_with_version}/geom") do
          RGeo::GeoJSON.encode(object.shapedata.geom) if object.respond_to?(:shapedata) && !object.shapedata.nil?
        end
      end

      def scope
        Rails.cache.fetch("#{cache_key_with_version}/scope") do
          object.scope if object.respond_to?(:scope)
        end
      end

      def has_geo_location?
        Rails.cache.fetch("#{cache_key_with_version}/has_geo_location") do
          object.respond_to?(:decidim_geo_space_location) && object.decidim_geo_space_location
        end
      end

      def location
        Rails.cache.fetch("#{cache_key_with_version}/location") do
          object.decidim_geo_space_location if has_geo_location?
        end
      end

      def has_coordinates?
        Rails.cache.fetch("#{cache_key_with_version}/has_coordinates") do
          (
            has_geo_location? &&
            !location.latitude.nil? &&
            !location.longitude.nil?
          ) || (
            object.respond_to?(:latitude) &&
            object.respond_to?(:longitude) &&
            !object.latitude.nil? &&
            !object.longitude.nil?
          )
        end
      end

      def component?
        @_component ||= object.respond_to?(:component)
      end

      def cache_key_with_version
        @cache_key_with_version ||= object.cache_key_with_version
      end
    end
  end
end
