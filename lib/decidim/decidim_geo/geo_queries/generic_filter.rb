# frozen_string_literal: true

module Decidim
  module Geo
    module Api
      class GenericFilter
        extend Forwardable

        def_delegators :@geo_query, :organization, :current_user, :locale, :filters
        attr_reader :geo_query, :options

        def initialize(geo_query)
          @geo_query = geo_query
        end

        ##
        # Gives the klass name of the model
        def self.model_klass
          raise "not implemented.@see #{name}#model_klass"
        end

        def model_klass
          self.class.model_klass
        end

        def self.klass
          @klass ||= model_klass.constantize
        end

        def klass
          self.class.klass
        end

        ##
        # The symbol that discrimine the filter.
        # For example :scope_id, :assembly_id, etc.
        def self.graphql_key
          raise "not implemented."
        end

        def graphql_key
          self.class.graphql_key
        end

        ##
        # If the filter is for a component
        def is_component?
          klass.include? Decidim::HasComponent
        end

        ##
        # If the filter is for a participatory space
        def is_participatory_space?
          klass.include? Decidim::ScopableParticipatorySpace
        end

        ##
        # Take the given matches ids.
        def apply_filters(_matches)
          raise "not implemented."
        end

        protected

        def extract_time_filter
          @extracted_time_filter ||= filters.find { |f| f[:time_filter].present? }
        end

        def time_filter
          return nil if extract_time_filter.nil?

          extract_time_filter.time_filter.time
        end

        def geoencode_filtered?
          !geoencoded_filter.nil?
        end

        def only_geoencoded?
          geoencode_filtered? && geoencoded_filter.geoencoded_filter.geoencoded
        end

        def exclude_geoencoded?
          geoencode_filtered? && !geoencoded_filter.geoencoded_filter.geoencoded
        end

        def geoencoded_filter
          @geoencoded_filter ||= filters.find { |f| f[:geoencoded_filter].present? }
        end
      end
    end
  end
end
