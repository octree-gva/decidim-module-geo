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
        byebug
        search_resources(kwargs[:filter])
        #filter_by_term(kwargs[:filter]) if kwargs[:filter].present?
        #filter_by_type(kwargs[:filter].resource_type) if kwargs[:filter].resource_type.present?
      end

      private

      def search_resources(filter)
        byebug
        if filter.nil?
          term, type, scope_id = nil
        else
          filter.term.nil? ? term = nil : term = filter.term
          filter.resource_type.nil? ? type = nil : type = filter.resource_type
          filter.scope_id.nil? ? scope_id = nil : scope_id = filter.scope_id
        end
        types = ['meeting', 'proposal', 'scope']
        Decidim::Search.call(term, organization) do 
          on(:ok) do |search_results| 
            data = []
            search_results.each do |resource_type, results|
              byebug
              type_name = resource_type.split("::").last.downcase
              if types.include?(type_name) && type.include?(type_name)
                results[:results].to_a.each { |items| data.append(items) } unless results[:results].to_a.empty?
              end
            end
            byebug
            return data
          end
        end
      end

      def filter_by_type(resource_type)
        types = ['meetings', 'proposals', 'scopes']
        data = []
        if resource_type.present?
          resource_type.map! { |type| type.downcase }
          types.each do |type| 
            data_obj(type: type).each {|data_obj| data.append(data_obj)} if resource_type.include?(type)
          end
        else
          types.each do |type| 
            data_obj(type: type).each {|data_obj| data.append(data_obj)}
          end
        end
        data
      end

      def data_obj(type: nil)
        data = []
        case type
        when 'meetings'
          meetings.each { |meeting| data.append(meeting) }
        when "proposals"
          proposals.each { |proposal| data.append(proposal) }
        when 'scopes'
          scopes.each { |scope| data.append(scope) }
        end unless type.nil?

        return data unless data.empty?
      end

      def meetings
        Decidim::Meetings::Meeting.all
      end

      def proposals
        Decidim::Proposals::Proposal.all
      end

      def scopes
        Decidim::Scope.all
      end

      

      def organization_locale
        given_organization ||= try(:current_organization)
        given_organization ||= try(:organization)
        given_organization.try(:default_locale)
      end

    end
  end
end
