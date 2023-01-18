# frozen_string_literal: true

source "https://rubygems.org"

ruby RUBY_VERSION

gem "decidim", "~> 0.26"
gem "decidim-geo", path: "."

gem 'activerecord-postgis-adapter', '~> 6.0.0'
gem 'rgeo-shapefile'

gem "puma", ">= 5.5.1"
gem "bootsnap", "~> 1.4"
gem "uglifier", "~> 4.1"

group :development, :test do
  gem "byebug", "~> 11.0", platform: :mri

  gem "decidim-dev", "~> 0.26"
end


group :test do
  gem 'rspec-rails', '~> 4.0'
end

group :development do
  gem "faker", "~> 2.14"
  gem "letter_opener_web", "~> 1.3"
  gem "listen", "~> 3.1"
  gem "spring", "~> 4.0"
  gem "spring-watcher-listen", "~> 2.0"
  gem "web-console", "4.0.4"  
end

gem "doorkeeper", "~> 5.6"
