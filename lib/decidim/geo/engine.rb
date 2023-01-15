# frozen_string_literal: true

require "rails"
require "decidim/core"

module Decidim
  module Geo
    # This is the engine that runs on the public interface of geo.
    class Engine < ::Rails::Engine
      isolate_namespace Decidim::Geo

      routes do
        # Add engine routes here
      end

      initializer "decidim_geo.content_blocks" do
        Decidim.content_blocks.register(:homepage, :geo_maps) do |content_block|
          content_block.cell = "decidim/geo/content_blocks/geo_maps"
          content_block.public_name_key = "decidim.geo.content_blocks.name"

          content_block.images = [
            {
              name: :background_image,
              uploader: "Decidim::HomepageImageUploader"
            }
          ]

          # content_block.default!
        end
      end

      initializer "add_cells_view_paths" do
        Cell::ViewModel.view_paths << File.expand_path("#{Decidim::Geo::Engine.root}/app/cells")
      end

      initializer "decidim.graphql_api" do
        Decidim::Api::QueryType.include Decidim::Geo::ShapefileQueryExtension
      end

      initializer "decidim_geo.webpacker.assets_path" do
        Decidim.register_assets_path File.expand_path("#{Decidim::Geo::Engine.root}/app/packs")
      end

    end
  end
end
