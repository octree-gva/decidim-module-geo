module Decidim
  module Geo
      class UpdateMeetingGeoIndexJob < ::ApplicationJob
        include Decidim::SanitizeHelper
        include Decidim::Geo::GeoIndexMethods
        queue_as :default

        alias :meeting :resource
        alias :meeting= :resource=

        def perform(meeting_id)
          @resource = Decidim::Meetings::Meeting.find(meeting_id)
          sync_meeting
        end

        private


        def sync_meeting
          return remove_meeting if remove_from_index?
          upsert_index(meeting.id, manifest_name,
            with_scope(
              with_coords(
                resource_url: resource_url,
                image_url: image_url,
                title: title,
                short_description: short_description,
                description_html: description,
                start_date: start_date,
                end_date: end_date,
                component_id: meeting.decidim_component_id,
                participatory_space_id: meeting.participatory_space.id,
                participatory_space_type: meeting.participatory_space.manifest.name.to_s,
                extended_data: {
                  start_time: meeting.start_time,
                  end_time: meeting.end_time
                }
            )))
            true
          rescue => e
            puts "Can index #{e}"
            false
        end

        def with_coords(decidim_geo_hash)
          return decidim_geo_hash unless meeting.type_of_meeting == "in_person"
          super(decidim_geo_hash)
        end
        
        def remove_meeting
          match = Decidim::Geo::Index.find_by(resource_id: meeting.id, resource_type: manifest_name)
          match.destroy if match
        end

        def remove_from_index?
          !meeting.visible?
        end

        def manifest_name
          meeting.component.manifest.name.to_s
        end
      end
  end
end