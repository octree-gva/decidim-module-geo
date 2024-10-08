# frozen_string_literal: true

require "decidim/gem_manager"

namespace :decidim_geo do
  namespace :term_customizer do
    desc "Create a term-customizer JSON file to import all module locales in admin"
    task export: :environment do
      raise "Decidim gem is not installed" if decidim_path.nil?
      raise "Decidim-Geo is not installed" unless Gem.loaded_specs.has_key?(gem_name)

      gem_export_file = decidim_geo_path.join("term-customizer.json")
      export_file = rails_app_path.join("tmp/decidim-geo-term-customizer.json")
      file_content = JSON.pretty_generate(parse_locales)
      File.write(export_file, file_content)
      File.write(gem_export_file, file_content)
      puts "decidim_geo::term_customizer: export done."
      puts "decidim_geo::term_customizer: @see #{export_file}"
    end

    def parse_locales
      yml_file = decidim_geo_path.join("config/locales/decidim-geo.en.yml")
      puts "decidim_geo::term_customizer: reference file #{yml_file}"
      yml_content = YAML.load_file(yml_file)
      flatten_hash(yml_content["en"], "")
    end

    def flatten_hash(hash, parent_key = "", result = [])
      hash.each do |key, value|
        new_key = parent_key.empty? ? key.to_s : "#{parent_key}.#{key}"

        if value.is_a?(Hash)
          flatten_hash(value, new_key, result)
        else
          result.push({
                        key: new_key,
                        value: value,
                        locale: "en"
                      })
        end
      end

      result
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
