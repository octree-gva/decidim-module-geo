module Decidim
  module Geo
    # GeoQueryExtension
    module QueryExtension

      def self.included(type)
        def geo_manifests
          { 
            "Decidim::Meetings::Meeting": true, 
            "Decidim::Proposals::Proposal": true, 
            "Decidim::Assembly": true,
            "Decidim::ParticipatoryProcess": true,
            "Decidim::Debates::Debate": false
          }
        end

        def supported_geo_components 
          geo_manifests.keys
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
        @geoencoded = kwargs[:filters].find {|f| f[:geoencoded_filter].present?}
        search_params = {locale: locale, class_name: supported_geo_components};
        if scope
          # Search only in a given scope
          search_params = search_params.merge({scope_ids: scope.scope_filter.scope_id})
        end
        if resource_type
          # search only for a resource type
          class_name = resource_type.resource_type_filter.resource_type
          search_params = search_params.merge({class_name: class_name}) unless class_name == "all"
        end
        search_results = filtered_query_for(**search_params)

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
        processes_matches = data_by_resource_type["Decidim::ParticipatoryProcess"] || []
        assemblies_matches = data_by_resource_type["Decidim::Assembly"] || []
        meetings_matches = data_by_resource_type["Decidim::Meetings::Meeting"] || []
        proposals_matches = data_by_resource_type["Decidim::Proposals::Proposal"] || []
        debates_matches = data_by_resource_type["Decidim::Debates::Debate"] || []
        if @time
          time_filter = @time.time_filter.time
          processes_matches = processes_time_filter(processes_matches, time_filter)
          assemblies_matches = assembly_time_filter(assemblies_matches, time_filter)
          meetings_matches = meeting_time_filter(meetings_matches, time_filter)
          # Proposals & Debates are always hidden when adding a time filter
          # in the past or the future, as they are not bound to time.
          proposals_matches = [] if ["past", "future"].include? time_filter
          debates_matches = [] if ["past", "future"].include? time_filter
        end

        only_geo_encoded = @geoencoded && @geoencoded.geoencoded_filter.geoencoded
        only_not_geo_encoded = @geoencoded && !@geoencoded.geoencoded_filter.geoencoded
        result = {
          "Decidim::Meetings::Meeting": meetings_matches, 
          "Decidim::Proposals::Proposal": proposals_matches, 
          "Decidim::Assembly": assemblies_matches,
          "Decidim::ParticipatoryProcess": processes_matches,
          "Decidim::Debates::Debate": debates_matches
        }.flat_map do |klass, match_ids|
          query = "#{klass}".constantize.where(id: match_ids)
          supports_geo = geo_manifests[klass]
          if only_geo_encoded
            next [] unless supports_geo
            query = query.where.not(latitude: nil) 
          end
          if only_not_geo_encoded
            next query unless supports_geo
            query = query.where(latitude: nil) 
          end
          query
        end
        result.flatten
      end

      def state_filter(filter)
        {decidim_scope_id: filter[:scope_ids]}.merge(decidim_participatory_space: spaces_to_filter(filter)).compact
      end
  
      def processes_time_filter(processes, time_filter)
        manifest = Decidim.participatory_space_manifests.find do |mani| 
          mani.name == :participatory_process
        end
        if !manifest
          return processes;
        end
        
        public_spaces = manifest.participatory_spaces.call(organization).public_spaces
        case time_filter
          when "active"
            public_spaces.active_spaces
          when "future"
            public_spaces.future_spaces
          when "past"
            public_spaces.past_spaces
        else
          public_spaces
        end
        public_spaces.where(id: processes).pluck(:id)
      end

      def assembly_time_filter(assemblies, time_filter)
        search_assembly = Decidim::Assembly.where(id: assemblies, private_space: false).published
        query = case time_filter
        when "past"
          search_assembly.where("duration < ?", DateTime.now)
        when "active"
          search_assembly.where(duration: 15.days.ago..15.days.since)
        when "future"
          search_assembly.where("included_at >= ?", 15.days.since)
        else
          search_assembly
        end
        query.pluck(:id)
      end

      def meeting_time_filter(meetings, time_filter)
        search_result = Decidim::Meetings::Meeting.where(id: meetings, private_meeting: false).published
        search_result = case time_filter
          when "past"
            search_result.where("end_time < ?", DateTime.now)
          when "active"
            search_result.where(
              # Meeting is happening
              "start_time <= ? AND end_time >= ?", DateTime.now, DateTime.now
            ).or(
              # Meeting is about to start
              search_result.where("start_time > ? AND start_time < ?", DateTime.now, 15.days.from_now)
            ).or(
              # Meeting has just ended
              search_result.where("end_time < ? AND end_time > ?", DateTime.now, 15.days.ago)
            )
          when "future"
            search_result.where("start_time >= ?", DateTime.now)
        else
          search_result
        end
        search_result.pluck(:id)
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
