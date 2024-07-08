# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class DebateFilter < GenericFilter
        def self.model_klass
          "Decidim::Debates::Debate"
        end

        def apply_filters(debate_ids)
          debates = Decidim::Debates::Debate.where(id: debate_ids).includes(:component, :scope)
          scoped_by_geoencoded(scoped_by_time(debates))
        end

        private

        def scoped_by_geoencoded(debates)
          return [] if only_geoencoded?
          debates
        end

        ##
        # Scope debates by time.
        # past: for closed debates
        # active and future: for open debates
        def scoped_by_time(debates)
          case time_filter
          when "past"
            debates.where.not(closed_at: nil)
          when "active", "future"
            debates.where(closed_at: nil)
          else
            debates
          end
        end
      end
    end
  end
  end
