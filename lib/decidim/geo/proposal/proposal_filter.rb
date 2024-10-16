# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class ProposalFilter < DefaultFilter
        def filter_past(query)
          query.where(resource_type: manifest_name, resource_status: %w(rejected)).or(
            super(query)
          )
        end

        def filter_active(query)
          query.where(resource_type: manifest_name, resource_status: %w(not_answered evaluating)).where(
            super(query)
          )
        end

        def filter_future(query)
          query.where(resource_type: manifest_name, resource_status: %w(not_answered evaluating)).or(
            super(query)
          )
        end
      end
    end
  end
end
