# frozen_string_literal: true

include ActiveStorage::Reflection::ActiveRecordExtensions
ActiveRecord::Reflection.singleton_class.prepend(ActiveStorage::Reflection::ReflectionExtension)
include ActiveStorage::Attached::Model

module Decidim
  module Geo
    module ShapefileScope
      # An attribute to include shapefile for create or update scopes.
      module AddShapefileScopeTypeForm
        include Virtus.module

        attribute :shapefile, Decidim::Geo::Shapefile

        def map_model(model)
          self.shapefile = model.shapefile.id unless model.shapefile.nil?
        end
      end
    end
  end
end
