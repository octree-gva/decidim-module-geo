# frozen_string_literal: true

$LOAD_PATH.push File.expand_path("lib", __dir__)

require "decidim/geo/version"

Gem::Specification.new do |s|
  s.version = Decidim::Geo.version
  s.authors = ["Hadrien Froger", "Renato Silva", "Simon Mulquin"]
  s.email = ["hadrien@octree.ch", "renato@octree.ch", "simon@octree.ch"]
  s.license = "AGPL-3.0"
  s.homepage = "https://git.octree.ch/decidim/decidim-module-geo"
  s.required_ruby_version = ">= 3.0"

  s.name = "decidim-decidim_geo"
  s.summary = "A decidim geo module"
  s.description = "Component for manage geo files, like shapefiles, in a participatory space."

  s.files = Dir["{app,config,lib,vendor,db}/**/*", "LICENSE-AGPLv3.txt", "Rakefile", "README.md"]

  s.add_dependency "activerecord-postgis-adapter", ">= 6.0"
  s.add_dependency "decidim-admin", Decidim::Geo.decidim_version
  s.add_dependency "decidim-core", Decidim::Geo.decidim_version
  s.add_dependency "deface", ">= 1.8.1"
  s.add_dependency "ffi-geos", "~> 2.4"
  s.add_dependency "rgeo", ">= 3.0"
  s.add_dependency "rgeo-geojson", ">= 1.0"
  s.add_dependency "rgeo-shapefile", ">= 1.0"

  s.add_development_dependency "decidim-dev", Decidim::Geo.decidim_version
  s.add_development_dependency "rubocop-faker"
  s.metadata["rubygems_mfa_required"] = "true"
end
