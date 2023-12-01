# frozen_string_literal: true

require "decidim/dev/common_rake"

def install_module(path)
  Dir.chdir(path) do
    system("bundle exec rake decidim_geo:install:migrations")
  end
end

def seed_db(path)
  Dir.chdir(path) do
    system("bundle exec rake db:seed")
  end
end

##
# Tasks for test_app
##

desc "Prepare for testing"
task :prepare_tests do
  # Remove previous existing db, and recreate one.
  Dir.chdir("development_app") do
    system("bundle exec rake db:drop")
    system("bundle exec rake db:create")
  end
  ENV["RAILS_ENV"] = "test"
  databaseYml = {
    "test" => {
      "adapter" => "postgis",
      "encoding" => "unicode",
      "host" => ENV.fetch("DATABASE_HOST", "localhost"),
      "port" => ENV.fetch("DATABASE_PORT", "5432").to_i,
      "username" => ENV.fetch("DATABASE_USERNAME", "decidim"),
      "password" => ENV.fetch("DATABASE_PASSWORD", "insecure-password"),
      "database" => "#{base_app_name}_test"
    }
  }
  config_file = File.expand_path("spec/decidim_dummy_app/config/database.yml", __dir__)
  File.open(config_file, "w") { |f| YAML.dump(databaseYml, f) }
  Dir.chdir("spec/decidim_dummy_app") do
     system("bundle exec rails db:migrate")
   end
end

desc "Generates a decidim_dummy_app app for testing"
task :test_app do
  Bundler.with_original_env do
    generate_decidim_app(
      "spec/decidim_dummy_app",
        "--app_name",
        "#{base_app_name}",
        "--path",
        "../..",
        "--skip_spring",
        "--demo",
        "--force_ssl",
        "false",
        "--locales",
        "en,fr,es"
    )
  end
  install_module("spec/decidim_dummy_app")
  Rake::Task["prepare_tests"].invoke
end

##
# Tasks for developement_app
##

desc "Prepare for development"
task :prepare_dev do
  # Remove previous existing db, and recreate one.
  Dir.chdir("development_app") do
    system("bundle exec rake db:drop")
    system("bundle exec rake db:create")
  end
  ENV["RAILS_ENV"] = "development"
  databaseYml = {
    "development" => {
      "adapter" => "postgis",
      "encoding" => "unicode",
      "host" => ENV.fetch("DATABASE_HOST", "localhost"),
      "port" => ENV.fetch("DATABASE_PORT", "5432").to_i,
      "username" => ENV.fetch("DATABASE_USERNAME", "decidim"),
      "password" => ENV.fetch("DATABASE_PASSWORD", "insecure-password"),
      "database" => "#{base_app_name}_development",
    }
  }
  config_file = File.expand_path("development_app/config/database.yml", __dir__)
  File.open(config_file, "w") { |f| YAML.dump(databaseYml, f) }
  Dir.chdir("development_app") do
    system("bundle exec rake db:migrate")
    system("npm install -D webpack-dev-server")
    #system("bundle exec rake decidim_geo:seed")
  end
end

desc "Generates a development app"
task :development_app do
  Bundler.with_original_env do
    generate_decidim_app(
      "development_app",
      "--app_name",
      "#{base_app_name}",
      "recreate_db",
      "--path",
      "..",
      "--skip_spring",
      "--demo",
      "--force_ssl",
      "false",
      "--demo"
    )
  end

  install_module("development_app")
  Rake::Task["prepare_dev"].invoke
end
