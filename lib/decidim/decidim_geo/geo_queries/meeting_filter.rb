# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class MeetingFilter < GenericFilter
        def self.model_klass
          "Decidim::Meetings::Meeting"
        end

        def apply_filters(meetings)
          meetings = meetings.visible_for(
            current_user
          )
          scoped_by_geoencoded(scoped_by_time(meetings))
        end

        def search_context
          Decidim::Meetings::Meeting.joins(:component).where.not(component: { published_at: nil }).left_joins(:attachments)
        end

        private

        def scoped_by_geoencoded(meetings)
          if !geoencode_filtered?
            meetings
          elsif only_geoencoded?
            meetings.where.not(latitude: nil)
          elsif exclude_geoencoded?
            meetings.where(latitude: nil)
          end
        end

        def scoped_by_time(meetings)
          case time_filter
          when "past"
            meetings.where("end_time < ?", Time.zone.now)
          when "future"
            meetings.where("start_time >= ?", Time.zone.now)
          when "active"
            # Active
            meetings.where(
              # Meeting is happening
              "start_time <= ? AND end_time > ?", Time.zone.now, Time.zone.now
            ).or(
              # Meeting is about to start (now..in 15 days)
              meetings.where(
                "start_time > ? AND start_time < ?",
                Time.zone.now,
                15.days.from_now
              )
            ).or(
              # Meeting has just ended (15days ago ... now)
              meetings.where(
                "end_time > ? AND end_time < ?",
                15.days.ago,
                Time.zone.now
              )
            )
          else
            meetings
          end
        end
      end
    end
  end
end
