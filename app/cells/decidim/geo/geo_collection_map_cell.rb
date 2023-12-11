# frozen_string_literal: true

module Decidim
  module Geo
    class GeoCollectionMapCell < Decidim::ViewModel
      delegate :current_user, to: :controller
      include Decidim::SanitizeHelper

      def show
        render
      end

      private
      def participatory_space?
        [
          "decidim/assemblies/assemblies:index",
          "decidim/participatory_processes/participatory_processes:index"
        ].include? "#{params[:controller]}:#{params[:action]}"
      end

      def search_controller?
        params[:controller] == "decidim/searches"
      end

      def search_options
        param_filter = params[:filter]
        return {} if param_filter.nil?
        param_filter.permit!
        filters = param_filter.keys.map do |key|
          case "#{key}"
          when "resource_type"
            {resourceTypeFilter: {resourceType: param_filter[key]}}
          when "term"
            {termFilter: {term: param_filter[key]}}
          when "decidim_scope_id"
            {scopeFilter: {scopeId: param_filter[key]}}
          when "space_state"
            {termFilter: {space_state: param_filter[key]}}
          end
        end.select {|v| !v.nil?}
        {
          id: "Search",
          filters: filters,
          scopes: []
        }
      end

      def collection_options
        case "#{params[:controller]}:#{params[:action]}"
        when "decidim/assemblies/assemblies:index"
            {
              id: "Assemblies",
              filters: assemblies_filter,
              scopes: Decidim::Assembly.visible_for(
                current_user
              ).where(
                parent_id: nil
              ).map { |a| a.scopes.map{ |s| s.id} }.flatten.uniq
            }
        when "decidim/participatory_processes/participatory_processes:index"
            {
              id: "Processes",
              filters: processes_filter,
              scopes: Decidim::ParticipatoryProcess.visible_for(
                current_user
              ).where(
                decidim_participatory_process_group_id: nil
              ).map { |a| a.scopes.map{ |s| s.id} }.flatten.uniq
            }
        else
          {}
        end
      end

      def assemblies_filter
        return [{resourceTypeFilter: {resourceType: "Decidim::Assembly"}}] if geo_config.only_assemblies
        []
      end

      def processes_filter
        return [{resourceTypeFilter: {resourceType: "Decidim::ParticipatoryProcess"}}] if geo_config.only_processes
        []
      end

      def geo_config
        Decidim::Geo::GeoConfig.geo_config_default
      end
    end
  end
end
  