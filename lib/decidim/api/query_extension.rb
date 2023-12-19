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
        @geoencoded = kwargs[:filters].find {|f| f[:geoencoded_filter].present?}
        search_params = {locale: locale, class_name: supported_geo_components};
        if scope
          # Search only in a given scope
          search_params = search_params.merge({scope_ids: scope.scope_filter.scope_id})
        end
        if resource_type
          # search only for a resource type
          search_params = search_params.merge({class_name: resource_type.resource_type_filter.resource_type})
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

        if @geoencoded
          
        end
        
        if @time
          processes_by_time = processes_time_filter(@time.time_filter.time)

          assemblies_ids = data_by_resource_type["Decidim::Assembly"]
          assemblies_by_time = assembly_time_filter(assemblies_ids, @time.time_filter.time) unless assemblies_ids.nil?

          meetings_ids = data_by_resource_type["Decidim::Meetings::Meeting"]
          meetings_by_time = meeting_time_filter(meetings_ids, @time.time_filter.time) unless meetings_ids.nil?

          proposals_ids = data_by_resource_type["Decidim::Proposals::Proposal"]
          proposals_by_time = proposal_time_filter(proposals_ids, @time.time_filter.time) unless proposals_ids.nil?
        end

        data_by_resource_type_filtered = {}
        data_by_resource_type.each do |key, values|
          processes_by_time.each do |process_key, process_id|
            if process_key == key
              data_by_resource_type_filtered.merge!({key => values.reject { |ids| !process_id.include?(ids)}})
            end
          end unless processes_by_time.nil?

          assemblies_by_time.each do |assembly_key, assembly_id|
            if assembly_key == key
              data_by_resource_type_filtered.merge!({key => values.reject { |ids| !assembly_id.include?(ids)}})
            end 
          end unless assemblies_by_time.nil?

          meetings_by_time.each do |meeting_key, meeting_id|
            if meeting_key == key
              data_by_resource_type_filtered.merge!({key => values.reject { |ids| !meeting_id.include?(ids)}})
            end
          end unless meetings_by_time.nil?
          
          proposals_by_time.each do |proposal_key, proposal_id|
            if proposal_key == key
              data_by_resource_type_filtered.merge!({key => values.reject { |ids| !proposal_id.include?(ids)}})
            end
          end unless proposals_by_time.nil?
        end

        data_by_resource_type.merge!(data_by_resource_type_filtered)

        result = data_by_resource_type.flat_map do |k, v|
          query = k.constantize.where(id: v)
          query = @geoencoded.geoencoded_filter.geoencoded ? query.where.not(latitude: nil) : query.where(latitude: nil) if @geoencoded
          query
        end
        result.flatten
      end

      def state_filter(filter)
        {decidim_scope_id: filter[:scope_ids]}.merge(decidim_participatory_space: spaces_to_filter(filter)).compact
      end
  
      def processes_time_filter(time_filter)
        processes = Decidim.participatory_space_manifests.flat_map do |manifest|
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
        end.each_with_object([]) do |process, array_processes| 
          array_processes.push(process.id) if process.class.name == "Decidim::ParticipatoryProcess"
        end
        return {"Decidim::ParticipatoryProcess" => []} if processes.empty?
        {"Decidim::ParticipatoryProcess" => processes}
      end

      def assembly_time_filter(assemblies, time_filter)
        search_result = assemblies.map do |id|
          search_assembly = Decidim::Assembly.where(id: id, private_space: false).published
          case time_filter
          when "past"
            search_assembly.where("duration < ?", DateTime.now)
          when "active"
            search_assembly.where(duration: 15.days.ago..15.days.since)
          when "future"
            search_assembly.where("included_at >= ?", 15.days.since)
          else
            search_assembly
          end
        end.each_with_object([]) do |assembly, array_assembly| 
          array_assembly.push(assembly.take.id) unless assembly.empty?
        end 
        return {"Decidim::Assembly" => []} if search_result.empty?
        {"Decidim::Assembly" => search_result}
      end

      def meeting_time_filter(meetings, time_filter)
        search_result = meetings.map do |id|
          search_meeting = Decidim::Meetings::Meeting.where(id: id, private_meeting: false).published
          case time_filter
          when "past"
            search_meeting.where("end_time < ?", DateTime.now)
          when "active"
            search_meeting.where("start_time <= ? AND end_time >= ?", DateTime.now, DateTime.now).or(search_meeting.where("start_time >= ?", DateTime.now))
          when "future"
            search_meeting.where("start_time >= ?", DateTime.now)
          else
            search_meeting
          end
        end.each_with_object([]) do |meeting, array_meeting| 
          array_meeting.push(meeting.take.id) unless meeting.empty?
        end 
        return {"Decidim::Meetings::Meeting" => []} if search_result.empty?
        {"Decidim::Meetings::Meeting" => search_result}
      end

      def proposal_time_filter(proposals, time_filter)
        search_result = proposals.map do |id|
          search_proposal = Decidim::Proposals::Proposal.where(id: id).published
          case time_filter
          when "past"
            search_proposal.where(state: ["rejected", "accepted"])
          when "active" || "future"
            search_proposal.where(state: ["not_answered", nil, "evaluating"])
          else
            search_proposal
          end
        end.each_with_object([]) do |proposal, array_proposal| 
          array_proposal.push(proposal.take.id) unless proposal.empty?
        end 
        return {"Decidim::Proposals::Proposal" => []} if search_result.empty?
        {"Decidim::Proposals::Proposal" => search_result}
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
