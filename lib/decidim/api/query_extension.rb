module Decidim
  module Geo
    # GeoQueryExtension
    module QueryExtension

      def self.included(type)
        def supported_geo_components 
          [ 
            "Decidim::Meetings::Meeting", 
            "Decidim::Proposals::Proposal", 
            "Decidim::Assembly",
            "Decidim::ParticipatoryProcess",
            "Decidim::Debates::Debate"
          ].freeze 
        end

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
        
        scope = kwargs[:filters].find {|f| f[:scope_filter].present?}
        resource_type = kwargs[:filters].find {|f| f[:resource_type_filter].present?}
        process = kwargs[:filters].find {|f| f[:process_filter].present?}
        assembly = kwargs[:filters].find {|f| f[:assembly_filter].present?}
        @time = kwargs[:filters].find {|f| f[:time_filter].present?}
        @search_params = {locale: locale, class_name: supported_geo_components};
        if scope
          # Search only in a given scope
          @search_params = @search_params.merge({scope_ids: scope.scope_filter.scope_id})
        end
        if resource_type
          # search only for a resource type
          @search_params = @search_params.merge({class_name: resource_type.resource_type_filter.resource_type})
        end
        search_results = filtered_query_for(**@search_params)
        if assembly
          # The results must be within an assembly
          search_results = search_results.where(
            decidim_participatory_space_type: "Decidim::Assembly",
            decidim_participatory_space_id: assembly.assembly_filter.assembly_id
          )
        end

        if process
          # The results must be within a process
          search_results = search_results.where(
            decidim_participatory_space_type: "Decidim::ParticipatoryProcess",
            decidim_participatory_space_id: process.process_filter.process_id
          )
        end

        if @time
          search_results = search_results.where(decidim_participatory_space_id: spaces_to_filter(@time.time_filter.time))
        end unless @search_params[:class_name] == "Decidim::Meetings::Meeting"

        fetch_results(search_results)
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
        fetch_results(
          filtered_query_for(locale: locale, class_name: supported_geo_components)
        )
      end

      def has_address?(resource)
        resource.respond_to?(:address) && resource.address.present?
      end

      def has_geo_scope?(resource)
        if resource.respond_to?(:scope)
          Decidim::Geo::Shapedata.exists?(decidim_scopes_id: resource.scope.id) if resource.scope.present?
        end
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
        result_query = result_query.order("datetime DESC")
        result_query = result_query.global_search(I18n.transliterate(term)) if term.present?
        result_query
      end

      def fetch_results(searcheable_results)
        data_by_resource_type = {}
        searcheable_results.select("resource_id,resource_type").each do |resource|
          data_by_resource_type[resource.resource_type] = [] unless data_by_resource_type[resource.resource_type].present?
          data_by_resource_type[resource.resource_type].push(resource.resource_id) 
        end

        data_by_resource_type.map do |k, v|
          if @time && !@search_params[:class_name].include?("Decidim::Meetings::Meeting")
            case @time.time_filter.time
            when "past"
              k.constantize.where(id: v).where("end_time < ?", DateTime.now)
            when "active"
              k.constantize.where(id: v).where(start_time: DateTime.now..30.days.since)
            when "future"
              k.constantize.where(id: v).where("start_time >= ?", 30.days.since)
            else
              k.constantize.where(id: v)
            end
          else
            k.constantize.where(id: v)
          end
        end.flatten
      end

      def state_filter(filter)
        {decidim_scope_id: filter[:scope_ids]}.merge(decidim_participatory_space: spaces_to_filter(filter)).compact
      end
  
      def spaces_to_filter(time_filter)
        Decidim.participatory_space_manifests.flat_map do |manifest|
          public_spaces = manifest.participatory_spaces.call(organization).public_spaces
          spaces = case time_filter
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

      def search_by_scope_params(filter, locale)
        scope = Decidim::Scope.where(id: filter.scope_id) if filter.scope_id.present?
        return {scope_ids: filter.scope_id, locale: locale} if scope.present?
        {}
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
