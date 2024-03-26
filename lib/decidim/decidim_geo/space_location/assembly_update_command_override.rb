
module Decidim
    module Geo
        module AssemblyUpdateCommandOverride
            extend ActiveSupport::Concern
            included do
                alias_method :decidim_original_attributes, :attributes
                
                def attributes
                    decidim_attributes = decidim_original_attributes
                    location = @assembly.decidim_geo_space_location || Decidim::Geo::SpaceLocation.new
                    location.address = form.decidim_geo_space_address
                    location.latitude = form.latitude
                    location.longitude = form.longitude
                    decidim_attributes[:decidim_geo_space_location] = location
                    decidim_attributes
                end
            end
        end
    end
end
