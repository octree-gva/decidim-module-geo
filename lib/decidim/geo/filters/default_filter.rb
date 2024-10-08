
module Decidim
    module Geo
      module Api
            class DefaultFilter < GenericFilter

                def filter_past(query)
                    query.where(resource_type: manifest_name).where("resource_type = ? AND end_date < ?", manifest_name, Time.zone.now.to_date)
                end
                def filter_active(query)
                    query.where(
                        # is happening
                        "resource_type = ? AND start_date <= ? AND end_date > ?", manifest_name, Time.zone.now.to_date, Time.zone.now.to_date
                      ).or(
                        # is about to start (now..in 15 days)
                        query.where(
                          "resource_type = ? AND start_date > ? AND start_date < ?",
                          manifest_name,
                          Time.zone.now.to_date,
                          15.days.from_now.to_date
                        )
                      ).or(
                        # has just ended (15days ago ... now)
                        query.where(
                          "resource_type = ? AND end_date > ? AND end_date < ?",
                          manifest_name,
                          15.days.ago.to_date,
                          Time.zone.now.to_date
                        )
                      ).or(
                        # does not end
                        query.where(
                          "resource_type = ? AND end_date IS NULL",
                          manifest_name
                        )
                      )
                end

                def filter_future(query)
                    query.where("resource_type = ? AND start_date >= ?", manifest_name, Time.zone.now.to_date)
                end
                            
            end
        end
    end
end