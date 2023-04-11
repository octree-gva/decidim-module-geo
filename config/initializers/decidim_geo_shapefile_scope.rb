# frozen_string_literal: true

require "active_storage/engine"

require "decidim/geo/shapefile_scope/add_shapefile_scope_type_form"

Decidim::Admin::ScopeTypeForm.include(Decidim::Geo::ShapefileScope::AddShapefileScopeTypeForm)
