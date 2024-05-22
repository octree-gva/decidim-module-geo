# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class ProposalFilter < GenericFilter
        def self.model_klass
          "Decidim::Proposals::Proposal"
        end

        def apply_filters(proposal_ids)
          proposals = Decidim::Proposals::Proposal.where(id: proposal_ids).includes(:component, :scope).left_joins(:attachments).published
          scoped_by_geoencoded(scoped_by_time(proposals))
        end

        private

        def scoped_by_geoencoded(proposals)
          if !geoencode_filtered?
            proposals
          elsif only_geoencoded?
            proposals.where.not(latitude: nil)
          elsif exclude_geoencoded?
            proposals.where(latitude: nil)
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
