# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

require 'decidim/geo/version'

Gem::Specification.new do |s|
  s.version = Decidim::Geo.version
  s.authors = ['Hadrien Froger', 'Renato Silva', 'Simon Mulquin']
  s.email = ['hadrien@octree.ch', 'renato@octree.ch', 'simon@octree.ch']
  s.license = 'AGPL-3.0'
  s.homepage = 'https://github.com/decidim/decidim-module-geo'
  s.required_ruby_version = '>= 2.7'

  s.name = 'decidim-geo'
  s.summary = 'A decidim geo module'
  s.description = "Component for manage geo files, like shapefiles, in a participatory space."

  s.files = Dir["{app,config,lib}/**/*", "LICENSE-AGPLv3.txt", "Rakefile", "README.md"]

  s.add_dependency 'decidim-admin', Decidim::Geo.version
  s.add_dependency 'decidim-core', Decidim::Geo.version
end
