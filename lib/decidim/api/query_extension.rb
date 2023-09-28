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
          argument :filters, [Decidim::Geo::GeoDatasourceInputFilter], "This argument let's you filter the results", required: false
        end
      end

      def geo_datasource(**kwargs)
        data = []
        if kwargs[:filters].present?
          kwargs[:filters].each do |filter|
            if filter[:term_filter].present?
              term = search_by_term(filter[:term_filter])
              term.each do |resource|
                data.append(resource) 
              end if term.present?
            elsif filter[:scope_filter].present?
              scope = search_by_scope(filter[:scope_filter])
              data.append(scope.take) if scope.present?
            elsif filter[:assembly_filter].present? 
              assembly = assembly_comp(filter[:assembly_filter])
              assembly.each do |component|  
                data.append(component) 
              end if assembly.present?
            elsif filter[:process_filter].present? 
              process = process_comp(filter[:process_filter])
              process.each do |component|  
                data.append(component) 
              end if process.present?
            end
          end
        end
        data
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

      private

      def assembly_comp(filter)
        assembly = Decidim::Assembly.where(id: filter.assembly_id) if filter.assembly_id.present?
        if assembly.present? && assembly.take.scope.present?
          return search_components(assembly) if Decidim::Geo::Shapedata.where(decidim_scopes_id: assembly.take.scope.id).present?
        end 
      end

      def process_comp(filter)
        process = Decidim::ParticipatoryProcess.where(id: filter.process_id) if filter.process_id.present?
        if process.present? && process.take.scope.present?
          return search_components(process) if Decidim::Geo::Shapedata.where(decidim_scopes_id: process.take.scope.id).present?
        end 
      end

      def search_components(space)
        data = []
        comp_proposals = space.take.components.select { |component| component.manifest.name == :proposals }
        comp_proposals.each do |comp_proposal|
          Decidim::Proposals::Proposal.where(decidim_component_id: comp_proposal.id).each do |proposal| 
            data.append(proposal) if proposal.class.method_defined?(:latitude) && proposal.latitude.present?
          end
        end if comp_proposals.present?

        comp_meetings = space.take.components.select { |component| component.manifest.name == :meetings }
        comp_meetings.each do |comp_meeting|
          Decidim::Meetings::Meeting.where(decidim_component_id: comp_meeting.id).each do |meeting| 
            data.append(meeting) if meeting.class.method_defined?(:latitude) && meeting.latitude.present?
          end
        end if comp_meetings.present?

        data
      end

      def search_by_term(filter)
        data = []
        if filter[:resource_type].present?
          resources = Decidim::Searchable.searchable_resources.select {|resource_type| resource_type == filter[:resource_type] }
        else
          resources = Decidim::Searchable.searchable_resources
        end
        resources.inject({}) do |results_by_type, (class_name, klass)|
          result_ids = filtered_query_for(class_name, filter).pluck(:resource_id)
          klass.find(result_ids).each do |result_data| 
            if result_data.class.method_defined?(:scope) && result_data.scope.present?
              if result_data.class.method_defined?(:component)
                data.append(result_data) if result_data.class.method_defined?(:latitude) && result_data.latitude.present?
              else
                data.append(result_data) if Decidim::Geo::Shapedata.where(decidim_scopes_id: result_data.scope.id).present?
              end
            end
          end
        end
        data
      end

      def filtered_query_for(class_name, filter)
        query = {organization: organization,
          locale: I18n.locale,
          resource_type: class_name,
        }

        query.update(decidim_scope_id: filter[:scope_id]) unless filter[:scope_id].nil?

        result_query = SearchableResource.where(query)

        state_filter(filter).map do |attribute_name, value|
          result_query = result_query.where(attribute_name => value)
        end if filter[:space_state].present?
  
        result_query = result_query.order("datetime DESC")
        result_query = result_query.global_search(I18n.transliterate(filter[:term])) if filter[:term].present?
        result_query
      end

      def state_filter(filter)
        {decidim_scope_id: filter[:scope_ids]}.merge(decidim_participatory_space: spaces_to_filter(filter)).compact
      end
  
      def spaces_to_filter(filter)  
        Decidim.participatory_space_manifests.flat_map do |manifest|
          public_spaces = manifest.participatory_spaces.call(organization).public_spaces
          spaces = case filter[:space_state]
                   when "active"
                     public_spaces.active_spaces
                   when "future"
                     public_spaces.future_spaces
                   when "past"
                     public_spaces.past_spaces
                   else
                     public_spaces
                   end
          spaces.select(:id).to_a
        end
      end

      def search_by_scope(filter)
        scope = Decidim::Scope.where(id: filter.scope_id) if filter.scope_id.present?
        if scope.present?
          return scope if Decidim::Geo::Shapedata.where(decidim_scopes_id: scope.take.id).present?
        end  
      end

      def geo_scopes_ids
        return Decidim::Geo::Shapedata.where.not(decidim_scopes_id: nil).map { |shp| shp.decidim_scopes_id }
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
