# frozen_string_literal: true

module Decidim
  module Geo
    # GeoQueryExtension
    module QueryExtension
      def self.geo_manifests
        {
          "Decidim::Meetings::Meeting": true,
          "Decidim::Proposals::Proposal": true,
          "Decidim::Assembly": true,
          "Decidim::ParticipatoryProcess": true,
          "Decidim::Debates::Debate": false
        }
      end

      def self.supported_geo_components
        geo_manifests.keys
      end

      def self.included(type)
        type.field :geo_shapefiles, [Decidim::Geo::GeoShapefileType], description: "Return's information about the shapefiles", null: true do
          argument :title, [String], required: false
        end

        type.field :geo_shapedata, [Decidim::Geo::GeoShapedataType], description: "Return's datas from shapefile",
                                                                     null: true do
          argument :name, [String], required: false
        end

        type.field :geo_config, Decidim::Geo::GeoConfigType, description: "Return's information about the geo config",
                                                             null: true

        type.field :geo_scope, [Decidim::Geo::GeoScopeApiType], description: "Return's scopes with shapedatas",
                                                                null: true do
          argument :id, type: [Integer], required: false
        end

        type.field :geo_datasource, Decidim::Geo::GeoDatasourceType.connection_type, null: true, extras: [:lookahead] do
          argument :filters, [Decidim::Geo::GeoDatasourceInputFilter], "This argument let's you filter the results",
                   required: false
          argument :locale, type: String, required: false
          argument :is_index, GraphQL::Types::Boolean, required: false, default_value: false
        end
      end

      def geo_datasource(**kwargs)
        locale = kwargs[:locale] || I18n.locale
        
        selects = if kwargs[:lookahead] &&  kwargs[:lookahead].selects?(:nodes) && kwargs[:lookahead].selection(:nodes).selections.size > 1
            kwargs[:lookahead].selection(:nodes).selections.map(&:name)
        else
          []
        end
        
        selects.push(:lonlat) if selects.delete(:coordinates)
        selects.push(:id)
        
        connection = ::Decidim::Geo::GeoDatasourceConnection.new(
          ::Decidim::Geo::Api::GeoQuery.new(
            current_organization,
            current_user,
            kwargs,
            locale
          ).results
        )
        connection.selected_attributes = selects
        connection
      end

      def geo_shapefiles(title: nil)
        return Decidim::Geo::Shapefile.where(title: title) if title.present?

        all_shapefiles = Decidim::Geo::Shapefile.all
        Rails.cache.fetch("decidim_geo/#{all_shapefiles.cache_key_with_version}") do
          all_shapefiles
        end
      end

      def geo_shapedata(name: nil)
        return Decidim::Geo::Shapedata.where("data->>'NAME' in (?)", name) if name.present?

        Decidim::Geo::Shapedata.all
      end

      def geo_config
        Decidim::Geo::GeoConfig.geo_config_default
      end

      def geo_scope(id: [])
        return Decidim::Scope.includes(:shapedata).all if id.empty?

        Decidim::Scope.includes(:shapedata).where(id: id)
      end

      private

      def current_user
        context[:current_user]
      end

      def current_organization
        context[:current_organization]
      end
    end
  end
end
