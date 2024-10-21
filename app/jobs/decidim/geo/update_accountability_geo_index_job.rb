# frozen_string_literal: true

module Decidim
  module Geo
    class UpdateAccountabilityGeoIndexJob < ::ApplicationJob
      include Decidim::SanitizeHelper
      include Decidim::Geo::GeoIndexMethods
      queue_as :default

      alias accountability_result resource
      alias accountability_result= resource=

      def perform(accountability_result_id)
        @resource_id = accountability_result_id
        @resource = Decidim::Accountability::Result.where(id: accountability_result_id).first
        return remove_accountability_result unless resource
        sync_accountability_result
      end

      private

      def sync_accountability_result
        return remove_accountability_result if remove_from_index?

        upsert_index(accountability_result.id, manifest_name,
                     with_scope(
                       with_coords(
                         resource_url: resource_url,
                         image_url: image_url,
                         title: title,
                         short_description: short_description,
                         description_html: description,
                         end_date: end_date,
                         start_date: start_date,
                         resource_status: nil,
                         component_id: accountability_result.decidim_component_id,
                         participatory_space_id: accountability_result.participatory_space.id,
                         participatory_space_type: accountability_result.participatory_space.manifest.name.to_s
                       )
                     ))
        true
      rescue StandardError => e
        Rails.logger.debug { "Can't index #{e}" }
        false
      end

      def remove_accountability_result
        match = Decidim::Geo::Index.find_by(resource_id: resource_id, resource_type: manifest_name)
        match.destroy if match
      end

      def remove_from_index?
        !accountability_result.visible?
      end

      def manifest_name
        "accountability"
      end
    end
  end
  end
