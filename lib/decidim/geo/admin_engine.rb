# frozen_string_literal: true

module Decidim
  module Geo
    # This is the engine that runs on the public interface of `Geo`.
    class AdminEngine < ::Rails::Engine
      isolate_namespace Decidim::Geo::Admin

      paths["db/migrate"] = nil
      paths["lib/tasks"] = nil

      routes do
        # Add admin engine routes here
        resources :shapefiles do 
          resources :attachments
        end

        resources :geo_configs

        root to: 'geo_configs#index'
      end

      initializer "decidim_geo.admin_mount_routes" do
        Decidim::Core::Engine.routes do
          mount Decidim::Geo::AdminEngine, at: "/admin/geo", as: "decidim_admin_geo"
        end
      end
    
      initializer "decidim_geo.webpacker.admin_assets_path" do
        Decidim.register_assets_path File.expand_path("#{Decidim::Geo::Engine.root}/app/packs/admin")
      end

      initializer "decidim_geo.admin_menu" do
        Decidim.menu :admin_menu do |menu|
          menu.add_item :geo, 
                        I18n.t("menu.geo", scope: "decidim.admin", default: "Geo"),
                        decidim_admin_geo.geo_configs_path,
                        icon_name: "map",
                        position: 10,
                        active: is_active_link?(decidim_admin_geo.geo_configs_path, :inclusive),
                        if: defined?(current_user) && current_user&.read_attribute("admin")
        end
      end

      initializer "decidim_geo.admin_geo_menu" do
        Decidim.menu :admin_geo_menu do |menu|
          menu.add_item :edit_config,
                        I18n.t("menu.geo", scope: "decidim.admin", default: "Configurations"),
                        decidim_admin_geo.geo_configs_path,
                        position: 1,
                        active: is_active_link?(decidim_admin_geo.geo_configs_path, :inclusive),
                        if: defined?(current_user) && current_user&.read_attribute("admin")

          menu.add_item :shapefiles,
                        I18n.t("menu.geo", scope: "decidim.admin", default: "Shapefiles"),
                        decidim_admin_geo.shapefiles_path,
                        position: 2,
                        active: is_active_link?(decidim_admin_geo.shapefiles_path, :inclusive),
                        if: defined?(current_user) && current_user&.read_attribute("admin")
        end
      end

      def load_seed
        nil
      end

    end
  end
end
