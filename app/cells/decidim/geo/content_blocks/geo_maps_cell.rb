# frozen_string_literal: true

module Decidim
  module Geo
    module ContentBlocks
      class GeoMapsCell < Decidim::ViewModel
        #delegate :current_user, to: :controller
        include Decidim::SanitizeHelper

        def show
          render unless @options.empty?
        end

        private

          def insert_map
            id = @options[:id] || "HomePage"
            config = {
              id: "#{id}", 
              locale: current_locale,
              selected_component: current_component || nil,
              filters: @options[:filters] || [],
              highlighted_scopes: has_current_participatory_space? ? current_scopes : [],
              map_config: {
                lat: geo_config_default.latitude,
                lng: geo_config_default.longitude,
                tile_layer: geo_config_default.tile,
                zoom: geo_config_default.zoom
              }
            }.with_indifferent_access

            content_tag(
              :div, 
              '',
              id: "GeoMap#{id}",
              class: [
                "js-decidimgeo", 
                "decidimgeo__map", 
                "decidimgeo__map--#{id.underscore}"
              ],
              "data-config" => config.to_json
            )
          end

          def i18n_type
            {
              "Decidim::Meetings::Meeting": t("decidim.meetings.admin.models.meeting.name"),
              "Decidim::Proposals::Proposal": t("decidim.proposals.admin.models.proposal.name"),
              "Decidim::ParticipatoryProcess": t("decidim.admin.models.participatory_process.name"),
              "Decidim::Assembly": t("decidim.admin.models.assembly.name")
            }.to_json
          end

          def current_locale
            I18n.locale.to_s
          end

          def current_component
            return request.env["decidim.current_component"].id if request.env["decidim.current_component"] 
            "none"
          end  

          def geo_config_default
            Decidim::Geo::GeoConfig.geo_config_default
          end

          def is_searches?
            @options[:context][:controller].controller_name == "searches"
          end

          def has_current_participatory_space?
            current_participatory_space ? true : false
          end

          def current_scopes
            return [current_participatory_space.scope.id] if current_participatory_space.respond_to?(:scope) && current_participatory_space.scope.present?

            scope_meetings.concat(scope_proposals).uniq
          end

          def scope_meetings
            resource("meetings")
          end

          def scope_proposals
            resource("proposals")
          end

          def resource(name)
            current_participatory_space.components.find_by(manifest_name: name).scopes.map { |scope| scope.id }
          end

          def current_participatory_space
            controller.view_context.current_participatory_space
          end
      end
    end
  end
end
