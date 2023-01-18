# frozen_string_literal: true

module Decidim
  module Geo
    module ContentBlocks
      class GeoMapsCell < Decidim::ViewModel
        #delegate :current_user, to: :controller

        def show
          render
        end
        
      end
    end
  end
end
