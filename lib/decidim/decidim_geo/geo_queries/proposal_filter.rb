# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class ProposalFilter < GenericFilter
        def self.model_klass
          "Decidim::Proposals::Proposal"
        end
        def self.active_for_manifest?(manifest_name)
          manifest_name.to_s == "proposals" || manifest_name.to_s == "reporting_proposals"
        end

        def apply_filters(proposals)
          proposals = proposals.left_joins(:attachments)
          scoped_by_geoencoded(scoped_by_time(proposals))
        end

        def search_context
          Decidim::Proposals::Proposal.published.joins(:component).where.not(component: { published_at: nil })
        end

        private

        def scoped_by_geoencoded(proposals)
          if !geoencode_filtered?
            proposals
          elsif only_geoencoded?
            proposals.where.not(latitude: nil)
          elsif exclude_geoencoded?
            proposals.where(latitude: nil)
          else
            proposals
          end
        end

        def scoped_by_time(proposals)
          case time_filter
          when "past"
            proposals.where(state: %w(rejected accepted))
          when "active", "future"
            proposals.where(state: %w(not_answered evaluating)).or(
              proposals.where(state: nil)
            )
          else
            proposals
          end
        end
      end
    end
  end
end
