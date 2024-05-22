# frozen_string_literal: true

require "rails"
require "decidim/core"
require "rgeo-geojson"

module Decidim
  module Geo
    # This is the engine that runs on the public interface of geo.
    class Engine < ::Rails::Engine
      isolate_namespace Decidim::Geo

      routes do
      end
      config.to_prepare do
        # API overrides
        Decidim::Api::QueryType.include Decidim::Geo::QueryExtension
        Decidim::ParticipatoryProcesses::ParticipatoryProcessInputFilter.include Decidim::Geo::HasScopeableInputFilter

        # Spaces locations
        Decidim::Assembly.include(Decidim::Geo::SpaceOverride)
        Decidim::Assemblies::Admin::AssemblyForm.include(Decidim::Geo::AssemblyFormOverride)
        Decidim::Assemblies::Admin::CreateAssembly.include(Decidim::Geo::AssemblyCreateCommandOverride)
        Decidim::Assemblies::Admin::UpdateAssembly.include(Decidim::Geo::AssemblyUpdateCommandOverride)

        Decidim::ParticipatoryProcess.include(Decidim::Geo::SpaceOverride)
        Decidim::ParticipatoryProcesses::Admin::ParticipatoryProcessForm.include(Decidim::Geo::ParticipatoryProcessFormOverride)
        Decidim::ParticipatoryProcesses::Admin::CreateParticipatoryProcess.include(Decidim::Geo::ParticipatoryProcessCommandOverride)
        Decidim::ParticipatoryProcesses::Admin::UpdateParticipatoryProcess.include(Decidim::Geo::ParticipatoryProcessCommandOverride)
      end

      initializer "decidim_geo.content_blocks" do
        Decidim.content_blocks.register(:homepage, :geo_maps) do |content_block|
          content_block.cell = "decidim/geo/content_blocks/geo_maps"
          content_block.public_name_key = "decidim.geo.content_blocks.name"
        end
      end

      initializer "add_cells_view_paths" do
        Cell::ViewModel.view_paths << File.expand_path("#{Decidim::Geo::Engine.root}/app/cells")
      end

      initializer "decidim.graphql_api" do
      end

      initializer "decidim_geo.check_rgeo" do
        Rails.logger.warn("GEOS is not available, but is required for correct interpretation of polygons in shapefiles") unless RGeo::Geos.supported?
      end

      initializer "decidim_geo.webpacker.assets_path" do
        Decidim.register_assets_path File.expand_path("#{Decidim::Geo::Engine.root}/app/packs")
      end
    end
  end
end
