# frozen_string_literal: true

module Decidim
  module Geo
    module HasScopeableInputFilter
      def self.included(child_class)
        child_class.argument :scope_id,
                              type: GraphQL::Types::ID,
                              description: "List result by Scope using decidim_scope_id",
                              required: false,
                              prepare: lambda { |scope_id, _ctx|
                                { decidim_scope_id: scope_id }
                              }
      end
    end
  end
end
