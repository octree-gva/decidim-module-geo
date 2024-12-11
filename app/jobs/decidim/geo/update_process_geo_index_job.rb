# frozen_string_literal: true

module Decidim
  module Geo
    class UpdateProcessGeoIndexJob < ::ApplicationJob
      include Decidim::SanitizeHelper
      include Decidim::Geo::GeoIndexMethods
      queue_as :default

      alias process resource
      alias process= resource=

      def perform(process_id)
        @resource_id = process_id
        @resource = Decidim::ParticipatoryProcess.where(id: process_id).first
        return remove_process unless resource

        sync_process
      end

      private

      def sync_process
        return remove_process if remove_from_index?

        upsert_index(process.id, manifest_name,
                     with_scope(
                       with_coords(
                         resource_url: resource_url,
                         image_url: image_url,
                         title: title,
                         short_description: short_description,
                         description_html: description,
                         component_id: nil,
                         start_date: start_date,
                         end_date: end_date,
                         participatory_space_id: process.id,
                         participatory_space_type: manifest_name
                       )
                     ))
        true
      rescue StandardError => e
        Rails.logger.debug { "Can not index #{e}" }
        raise e
      end

      def remove_process
        match = Decidim::Geo::Index.find_by(resource_id: resource_id, resource_type: manifest_name)
        match.destroy if match
        decidim_geo_update_components!(Decidim::ParticipatoryProcess)
      end

      def remove_from_index?
        !process.visible?
      end

      def manifest_name
        "participatory_processes"
      end
    end
  end
end
