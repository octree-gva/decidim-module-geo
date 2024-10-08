# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class GenericFilter
        extend Forwardable

        def_delegators :@geo_query, :organization, :current_user, :locale, :filters, :participatory_spaces
        attr_reader :geo_query, :manifest_name

        def initialize(geo_query, manifest_name)
          @geo_query = geo_query
          @manifest_name = manifest_name
        end

        def filter_past(_query)
          raise "not implemented.@see #{self.class.name} #filter_past"
        end

        def filter_active(_query)
          raise "not implemented.@see #{self.class.name} #filter_active"
        end

        def filter_future(_query)
          raise "not implemented.@see #{self.class.name} #filter_future"
        end
      end
    end
  end
end
