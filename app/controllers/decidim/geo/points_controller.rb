# frozen_string_literal: true

module Decidim
  module Geo
    class PointsController < ::Decidim::Api::ApplicationController
      before_action :set_default_format

      def count
        render json: { count: query.select(:id).where(query.arel_table[:id].gt(after_params)).count }
      end

      def index
        results = query.select(
          permitted_fields_params
        ).where(
          query.arel_table[:id].gt(after_params)
        ).limit(
          first_params
        ).reorder(
          id: :asc
        )
        last_modified = query.maximum(:updated_at) || 1.year.from_now
        etag = "#{query.cache_key_with_version}/params-#{Digest::MD5.hexdigest(permitted_params.to_json)}"
        return unless stale?(last_modified: last_modified.utc, etag: etag)

        last_id = query.maximum(:id)
        geo_scope_ids = query.select(:geo_scope_id).group(:geo_scope_id).pluck(:geo_scope_id).compact
        render json: {
          meta: {
            fields: permitted_fields_params,
            filters: filters_params,
            organization: current_organization.id,
            end_cursor: results.last && results.last.id,
            default_locale: current_organization.default_locale,
            first: first_params,
            after: after_params,
            has_more: results.last && results.last.id != last_id,
            geo_scope_ids: geo_scope_ids || []
          },
          data: results
        }
      end

      private

      def permitted_params
        @permitted_params ||= params.permit(:first, :after, :locale, :is_index, :format, fields: [], filters: [])
      end

      def first_params
        @first_params ||= (permitted_params[:first] || "50").to_i
      end

      def after_params
        @after_params ||= (permitted_params[:after] || "0").to_i
      end

      def query
        ::Decidim::Geo::Api::GeoQuery.new(
          current_organization,
          current_user,
          {
            filters: filters_params,
            is_index: index_params?
          },
          locale_param
        ).results
      end

      def index_params?
        @index_params ||= permitted_params[:is_index] || false
      end

      def locale_param
        @locale_param ||= permitted_params[:locale] || I18n.default_locale
      end

      def filters_params
        @filters_params ||= (permitted_params[:filters] || []).map { |f| JSON.parse(f).with_indifferent_access }
      end

      def fields_params
        @fields_params ||= permitted_params[:fields] || []
      end

      def include_lonlat?
        fields_params.include? "lonlat"
      end

      def permitted_fields_params
        @permitted_fields_params ||= begin
          allowed_fields = %w(
            resourceUrl
            resourceId
            resourceStatus
            participatorySpaceId
            participatorySpaceType
            componentId
            resourceType
            startDate
            endDate
            title
            shortDescription
            descriptionHtml
            imageUrl
            lonlat
            geoScopeId
            extendedData
            lonlat
          )

          filtered_fields = fields_params.select { |field| allowed_fields.include?(field.to_s) }
          filtered_fields.push("id")
          filtered_fields.map(&:underscore)
        end
      end

      def set_default_format
        request.format = :json
      end
    end
  end
end
