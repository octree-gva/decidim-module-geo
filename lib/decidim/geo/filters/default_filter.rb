# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class DefaultFilter < GenericFilter
        def filter_past(query)
          query.where("resource_type = ? AND end_date <= ?", manifest_name, Time.zone.now.to_date)
        end

        def filter_active(query)
          query.where(
            # is happening
            "resource_type = ? AND ((start_date <= ? AND end_date > ?) OR (end_date IS NULL))", manifest_name, 15.days.from_now.to_date, 15.days.ago.to_date
          )
        end

        def filter_future(query)
          query.where("resource_type = ? AND start_date >= ?", manifest_name, Time.zone.now.to_date)
        end
      end
    end
  end
end
