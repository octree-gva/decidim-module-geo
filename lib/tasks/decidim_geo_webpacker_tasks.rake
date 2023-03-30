# frozen_string_literal: true

require "decidim/gem_manager"

namespace :decidim_geo do
  namespace :webpacker do
    desc "Installs Decidim Geo webpacker files in Rails instance application"
    task install: :environment do
      raise "Decidim gem is not installed" if decidim_path.nil?

      install_decidim_geo_npm
    end

    desc "Adds Decidim Geo dependencies in package.json"
    task upgrade: :environment do
      raise "Decidim gem is not installed" if decidim_path.nil?

      install_decidim_geo_npm
    end

    def install_decidim_geo_npm
      decidim_geo_npm_dependencies.each do |type, packages|
        puts "install NPM packages. You can also do this manually with this command:"
        puts "npm i --legacy-peer-deps --save-#{type} #{packages.join(" ")}"
        system! "npm i --legacy-peer-deps --save-#{type} #{packages.join(" ")}"
      end
    end

    def decidim_geo_npm_dependencies
      @decidim_geo_npm_dependencies ||= begin
        package_json = JSON.parse(File.read(decidim_geo_path.join("package.json")))

        { dev: package_json["dependencies"].map { |package, version| "#{package}@#{version}" }}.freeze
      end
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

    def copy_geo_file_to_application(origin_path, destination_path = origin_path)
      FileUtils.cp(decidim_geo_path.join(origin_path), rails_app_path.join(destination_path))
    end

    def system!(command)
      system("cd #{rails_app_path} && #{command}") || abort("\n== Command #{command} failed ==")
    end

    def gem_name
      "decidim-geo"
    end
  end
end
