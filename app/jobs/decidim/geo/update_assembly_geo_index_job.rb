# frozen_string_literal: true

module Decidim
  module Geo
    class UpdateAssemblyGeoIndexJob < ::ApplicationJob
      include Decidim::SanitizeHelper
      include Decidim::Geo::GeoIndexMethods
      queue_as :default

      alias assembly resource
      alias assembly= resource=

      def perform(assembly_id)
        @resource_id  = assembly_id
        @resource = Decidim::Assembly.where(id: assembly_id).first
        return remove_assembly unless resource
        sync_assembly
      end

      private

      def sync_assembly
        return remove_assembly if remove_from_index?

        index_payload = {
          resource_url: resource_url,
          image_url: image_url,
          title: title,
          short_description: short_description,
          description_html: description,
          component_id: nil,
          participatory_space_id: assembly.id,
          participatory_space_type: manifest_name
        }
        upsert_index(assembly.id, manifest_name,
                     with_scope(
                       with_coords(
                         with_dates(
                           index_payload
                         )
                       )
                     ))
        true
      rescue StandardError => e
        Rails.logger.debug { "Error: can not geo-index this assembly: #{e}" }
        false
      end

      def with_dates(decidim_geo_hash)
        decidim_geo_hash[:start_date] = assembly.included_at.to_date if assembly.included_at
        decidim_geo_hash[:end_date] = assembly.closing_date.to_date if assembly.closing_date
        decidim_geo_hash
        end

      def remove_assembly
        match = Decidim::Geo::Index.find_by(resource_id: resource_id, resource_type: manifest_name)
        match.destroy if match
        decidim_geo_update_components!(Decidim::Assembly)
      end

      def remove_from_index?
        !assembly.visible? || !Decidim::Assembly.visible_for(nil).find(assembly.id)
      end

      def manifest_name
        "assemblies"
      end
    end
  end
  end
