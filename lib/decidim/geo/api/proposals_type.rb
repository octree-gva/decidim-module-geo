# frozen_string_literal: true

module Decidim
  module Geo
    class ShapefileListHelper < Decidim::Core::ComponentListBase
      # only querying published posts
      def query_scope
        super.published
      end
    end

    class ShapefileFinderHelper < Decidim::Core::ComponentFinderBase
      # only querying published posts
      def query_scope
        super.published
      end
    end

    class ShapefilesType < Decidim::Api::Types::BaseObject
      implements Decidim::Core::ComponentInterface

      graphql_name "Shapefiles"
      description "A geo component of a participatory space."

      field :proposals, type: Decidim::Proposals::ProposalType.connection_type, description: "List all proposals", connection: true, null: true do
        argument :order, Decidim::Proposals::ProposalInputSort, "Provides several methods to order the results", required: false
        argument :filter, Decidim::Proposals::ProposalInputFilter, "Provides several methods to filter the results", required: false
      end

      field :proposal, type: Decidim::Proposals::ProposalType, description: "Finds one proposal", null: true do
        argument :id, GraphQL::Types::ID, "The ID of the proposal", required: true
      end

      def shapefiles(filter: {}, order: {})
        Decidim::Geo::ShapefileListHelper.new(model_class: Proposal).call(object, { filter: filter, order: order }, context)
      end

      def shapefile(id:)
        Decidim::Geo::ShapefileFinderHelper.new(model_class: Shapefile).call(object, { id: id }, context)
      end
    end
  end
end
