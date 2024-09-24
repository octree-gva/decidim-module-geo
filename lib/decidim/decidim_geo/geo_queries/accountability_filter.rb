# frozen_string_literal: true

module Decidim
    module Geo
      module Api
        class AccountabilityFilter < GenericFilter
          def self.model_klass
            "Decidim::Accountability::Result"
          end
  
          def apply_filters(results)
            scoped_by_geoencoded(scoped_by_time(results.includes(:component, :scope)))
          end
          def self.active_for_manifest?(manifest_name)
            manifest_name.to_s == "accountability"
          end
  
          private
  
          def scoped_by_geoencoded(results)
            if !geoencode_filtered?
                results.left_joins(:decidim_geo_space_location)
              elsif only_geoencoded?
                results.joins(:decidim_geo_space_location).where.not(decidim_geo_space_location: { latitude: nil })
              elsif exclude_geoencoded?
                results.left_joins(:decidim_geo_space_location).where(decidim_geo_space_location: { latitude: nil })
              end
          end
  
          ##
          # Scope results by time.
          # past: for closed results
          # active and future: for open results
          def scoped_by_time(results)
            case time_filter
            when "past"
              results.where("end_date IS NOT NULL AND end_date < ?", Time.zone.now)
            when "active"
              results.where(
                end_date: nil, 
                start_date: nil
              ).or(
                results.where('end_date IS NOT NULL && end_date >= ?', Time.zone.now)
              ).or(
                results.where('start_date IS NOT NULL && start_date <= ?', Time.zone.now)
              )
            when "future"
              results.where("start_date IS NOT NULL && start_date > ?", Time.zone.now)
            else
              results
            end
          end
        end
      end
    end
  end
  