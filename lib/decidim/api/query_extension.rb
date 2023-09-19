module Decidim
  module Geo
    # GeoQueryExtension
    module QueryExtension
      
      def self.included(type)
        type.field :geo_shapefiles, [Decidim::Geo::GeoShapefileType], description: "Return's information about the shapefiles", null: true do
          argument :title, [String], required: false
        end

        type.field :geo_shapedata, [Decidim::Geo::GeoShapedataType], description: "Return's datas from shapefile", null: true do
          argument :name, [String], required: false
        end

        type.field :geo_config, Decidim::Geo::GeoConfigType, description: "Return's information about the geo config", null: true

        type.field :geo_scope, [Decidim::Geo::GeoScopeApiType], description: "Return's scopes with shapedatas", null: true do
          argument :name, [String], required: false
        end

        type.field :geo_datasource, Decidim::Geo::GeoDatasourceType.connection_type, null: true do
          argument :filter, Decidim::Geo::GeoDatasourceInputFilter, "This argument let's you filter the results", required: false
        end
      end

      def geo_shapefiles(title: nil)
        return Decidim::Geo::Shapefile.where(title: title) if title.present?

        Decidim::Geo::Shapefile.all
      end

      def geo_shapedata(name: nil)
        return Decidim::Geo::Shapedata.where("data->>'NAME' in (?)", name) if name.present?

        Decidim::Geo::Shapedata.all
      end

      def geo_config
        Decidim::ContentBlock.where(manifest_name: 'geo_maps').take.settings
      end

      def geo_scope(name: nil)
        return Decidim::Scope.where("name->>'#{organization_locale}' in (?)", name) if name.present?

        Decidim::Scope.all
      end

      def geo_datasource(**kwargs)
        search_resources(kwargs[:filter])
      end

      private

      def search_resources(filter)

        types = ['Decidim::Meetings::Meeting', 
                'Decidim::Proposals::Proposal', 
                'Decidim::Scope'].freeze

        data = []
        
        if filter.nil?
          types.each do |type| 
            filtered_query_for(class_name: type, term: nil, scope_id: nil).each {|resource_type_data| data.append(resource_type_data)}
          end
        else
          filter.term.nil? ? term = nil : term = filter.term
          filter.resource_type.nil? ? resource_types = nil : resource_types = filter.resource_type
          filter.scope_id.nil? ? scope_id = nil : scope_id = filter.scope_id

          types.each do |type| 
            filtered_query_for(class_name: type, term: term, scope_id: scope_id).each do |resource_type_data| 
              resource_types.each do |resource_type|
                data.append(resource_data(resource_type_data)) if (resource_type.present? && type.include?(resource_type.downcase.capitalize))
              end
            end 
          end
        end          
        data
      end

      def filtered_query_for(class_name: nil, term: nil, scope_id: nil)
        query = {organization: organization,
          locale: I18n.locale,
          resource_type: class_name,
        }

        query.update(decidim_scope_id: scope_id) unless scope_id.nil?

        result_query = SearchableResource.where(query)
  
        result_query = result_query.order("datetime DESC")
        result_query = result_query.global_search(I18n.transliterate(term)) unless term.nil?
        result_query
      end

      def resource_data(resource_type_data)
        resource_type_data[:resource_type].split('::').inject(Object) {|o,c| o.const_get c}.find(resource_type_data[:resource_id])
      end

      def organization_locale
        given_organization ||= try(:current_organization)
        given_organization ||= try(:organization)
        given_organization.try(:default_locale)
      end

    end
  end
end
