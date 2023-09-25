# frozen_string_literal: true

module Decidim
  module Geo
    module ContentBlocks
      class GeoMapsCell < Decidim::ViewModel
        #delegate :current_user, to: :controller
        include Decidim::SanitizeHelper

        def show
          render
        end

        private

          def insert_map(id, **data)
            config = {
              id: "#{id}", 
              locale: current_locale,
              selected_component: current_component || nil,
              **data
            }.with_indifferent_access
            config[:filters] = [] unless config[:filters].present?

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

          def current_locale
            I18n.locale.to_s
          end

          def current_component
            model.component
          end  
      end
    end
  end
end
