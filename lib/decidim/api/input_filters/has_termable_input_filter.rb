# frozen_string_literal: true

module Decidim
  module Geo
    module HasTermableInputFilter
      def self.included(child_class)
        child_class.argument :term,
                              type: String,
                              description: "List result by Scope using decidim_scope_id",
                              required: false
                              #prepare: lambda { |term, ctx| term }

        child_class.argument :resource_type,
                              type: [String],
                              description: "List result by Scope using decidim_scope_id",
                              required: false
                              #prepare: lambda { |resource_type, ctx| resource_type }
      end      
    end
  end
end
