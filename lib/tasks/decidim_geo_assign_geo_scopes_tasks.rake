# frozen_string_literal: true

require "decidim/gem_manager"

namespace :decidim_geo do
  namespace :automatic_scopes do
    desc "Assign Scopes automatically"
    task export: :environment do
      raise "Decidim gem is not installed" if decidim_path.nil?
      raise "Decidim-Geo is not installed" unless Gem.loaded_specs.has_key?(gem_name)

      
    end


    def decidim_geo_path
      @decidim_geo_path ||= Pathname.new(decidim_geo_gemspec.full_gem_path) if Gem.loaded_specs.has_key?(gem_name)
    end

    def decidim_geo_gemspec
      @decidim_geo_gemspec ||= Gem.loaded_specs[gem_name]
    end

    def rails_app_path
      @rails_app_path ||= Rails.root
    end

    def system!(command)
      system("cd #{rails_app_path} && #{command}") || abort("\n== Command #{command} failed ==")
    end

    def gem_name
      "decidim-decidim_geo"
    end
  end
end
