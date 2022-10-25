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

      initializer "decidim_geo.webpacker.assets_path" do
        Decidim.register_assets_path File.expand_path("app/packs", root)
      end

    end
  end
end
