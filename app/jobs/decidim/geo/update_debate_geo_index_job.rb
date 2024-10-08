# frozen_string_literal: true

module Decidim
  module Geo
    class UpdateDebateGeoIndexJob < ::ApplicationJob
      include Decidim::SanitizeHelper
      include Decidim::Geo::GeoIndexMethods
      queue_as :default

      alias debate resource
      alias debate= resource=

      def perform(meeting_id)
        @resource = Decidim::Debates::Debate.find(meeting_id)
        sync_meeting
      end

      private

      def sync_meeting
        return remove_meeting if remove_from_index?

        upsert_index(debate.id, manifest_name,
                     with_scope(
                       with_coords(
                         resource_url: resource_url,
                         image_url: image_url,
                         title: title,
                         short_description: short_description,
                         description_html: description,
                         end_date: end_date,
                         component_id: debate.decidim_component_id,
                         participatory_space_id: debate.participatory_space.id,
                         participatory_space_type: debate.participatory_space.manifest.name.to_s,
                         extended_data: {
                           start_time: debate.start_time,
                           end_time: debate.end_time
                         }
                       )
                     ))
        true
      rescue StandardError => e
        Rails.logger.debug { "Can index #{e}" }
        false
      end

      def end_date
        resource.closed_at.to_date if resource.closed_at
      end

      def remove_meeting
        match = Decidim::Geo::Index.find_by(resource_id: debate.id, resource_type: manifest_name)
        match.destroy if match
      end

      def remove_from_index?
        !debate.visible?
      end

      def manifest_name
        debate.component.manifest.name.to_s
      end
    end
  end
  end
