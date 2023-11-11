module Decidim
  module Geo
    # GeoQueryExtension
    module QueryExtension

      def self.included(type)
        def supported_geo_components; ["Decidim::Meetings::Meeting", "Decidim::Proposals::Proposal"] end

        type.field :geo_shapefiles, [Decidim::Geo::GeoShapefileType], description: "Return's information about the shapefiles", null: true do
          argument :title, [String], required: false
        end

        type.field :geo_shapedata, [Decidim::Geo::GeoShapedataType], description: "Return's datas from shapefile", null: true do
          argument :name, [String], required: false
        end

        type.field :geo_config, Decidim::Geo::GeoConfigType, description: "Return's information about the geo config", null: true

        type.field :geo_scope, [Decidim::Geo::GeoScopeApiType], description: "Return's scopes with shapedatas", null: true do
          argument :id, type: [Integer], required: false
        end

        type.field :geo_datasource, Decidim::Geo::GeoDatasourceType.connection_type, null: true do
          argument :filters, [Decidim::Geo::GeoDatasourceInputFilter], "This argument let's you filter the results", required: false
          argument :locale, type: String, required: false
        end
      end

      def geo_datasource(**kwargs)
        locale = kwargs[:locale] || I18n.locale
        return nofilter_datasource(locale) unless kwargs[:filters].present?
        data = []
        kwargs[:filters].each do |filter|
          data.push(*term_datasource(filter[:term_filter], locale)) if filter[:term_filter].present?
          data.push(*scope_datasource(filter[:scope_filter], locale)) if filter[:scope_filter].present?
          data.push(*assembly_datasource(filter[:assembly_filter], locale)) if filter[:assembly_filter].present?
          data.push(*process_datasource(filter[:process_filter], locale)) if filter[:process_filter].present?
          data.push(*resource_type_datasource(filter[:resource_type_filter], locale)) if filter[:resource_type_filter].present?
          data.push(*process_group_datasource(filter[:process_group_filter], locale)) if filter[:process_group_filter].present?
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
        Decidim::Geo::GeoConfig.geo_config_default
      end

      def geo_scope(id: [])
        return Decidim::Scope.all if id.empty?
        Decidim::Scope.where(id: id)
      end

      private

      def nofilter_datasource(locale)
        search_resources(locale: locale)
      end

      def term_datasource(term_filter, locale)
        term = term_filter.term
        resource_type = term_filter.resource_type
        scope_ids = term_filter.scope_ids
        space_state = term_filter.space_state

        search_resources(type: resource_type, term: term, scope_ids: scope_ids, space_state: space_state, locale: locale)
      end
      
      def scope_datasource(scope_filter, locale)
        search_by_scope(scope_filter, locale)
      end

      def assembly_datasource(assembly_filter, locale)
        participatory_space(assembly_filter.assembly_id, Decidim::Assembly, locale)
      end

      def process_datasource(process_filter)
        participatory_space(process_filter.process_id, Decidim::ParticipatoryProcess, locale)
      end

      def resource_type_datasource(resource_type_filter, locale)
        resource_type = resource_type_filter.resource_type
        resource_id = resource_type_filter.resource_id
        
        search_resources(type: resource_type, id: resource_id, locale: locale)
      end

      def process_group_datasource(process_group_filter, locale)
        data = []

        process_group = Decidim::ParticipatoryProcessGroup.find(process_group_filter.process_group_id) 
          rescue ActiveRecord::RecordNotFound
            nil
        
        if process_group.present?
          process_ids = process_group.participatory_processes.map { |process| process.id }
          process_ids.each do |process_id|
            data.push(*participatory_space(process_id, Decidim::ParticipatoryProcess)) 
          end
        end

        data
      end

      def participatory_space(space_id, klass, locale)
        return [] unless space_id.present?
        space = klass.find_by(id: space_id) 
        return [] unless space

        data = []
        if has_address?(space)
          data.append(space) 
        end

        # Get all the component for the participatory space.
        data.concat(
          search_resources(spaces: space, locale: locale)
        )
        # Get all the components that are bounded to the scope.
        data.concat(
          search_resources(scope_ids: space.scope.id, locale: locale)
        ) if space.scope

        data
      end

      def search_resources(type: nil, id: nil, term: nil, scope_ids: nil, space_state: nil, locale: I18n.locale, spaces: nil)
        searchable_resources = type.present? ? [type] : supported_geo_components
      
        data = searchable_resources.flat_map do |klass_name|
          result_ids = filtered_query_for(
            class_name: klass_name, 
            id: id, 
            term: term, 
            scope_ids: scope_ids, 
            space_state: space_state, 
            locale: locale,
            spaces: spaces
            ).select("resource_id").pluck(:resource_id)
          klass_name.constantize.where(id: result_ids).select { |result_data| has_address?(result_data) }
        end
      
        data
      end

      def has_address?(resource)
        resource.respond_to?(:address) && resource.address.present?
      end


      def filtered_query_for(class_name: nil, id: nil, term: nil, scope_ids: nil, space_state: nil, locale: nil, spaces: nil)
        query = {organization: organization,
          locale: locale,
          resource_type: class_name,
        }
        if scope_ids.present?
          query.update(decidim_scope_id: scope_ids)
        end
        query.update(decidim_participatory_space: spaces) if spaces.present?

        query.update(resource_id: id) if id.present?
        result_query = SearchableResource.where(query)

        state_filter(filter).map do |attribute_name, value|
          result_query = result_query.where(attribute_name => value)
        end if space_state.present?
  
        result_query = result_query.order("datetime DESC")
        result_query = result_query.global_search(I18n.transliterate(term)) if term.present?
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

      def search_by_scope(filter, locale)
        scope = Decidim::Scope.where(id: filter.scope_id) if filter.scope_id.present?
        search_resources(scope_ids: filter.scope_id, locale: locale) if scope.present?
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
