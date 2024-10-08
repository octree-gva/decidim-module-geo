# frozen_string_literal: true

module Decidim
  module Geo
    module Admin
      # A command with all the business logic when a user creates a new proposal.
      class CreateShapefile < Decidim::Geo::Command
        # Public: Initializes the command.
        #
        # form - A form object with the params.
        def initialize(form)
          @form = form
        end

        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid, together with the shapefile.
        # - :invalid if the form wasn't valid and we couldn't proceed.
        #
        # Returns nothing.
        def call
          return broadcast(:invalid) if form.invalid?

          create_shapefile
          load_shapefile = ShapefileLoader.new(@shapefile)
          load_shapefile.run!
          broadcast(:ok, @shapefile)
        rescue StandardError => e
          @shapefile.destroy
          broadcast(:invalid, e.to_s)
        end

        private

        attr_reader :form

        def create_shapefile
          @shapefile = Decidim::Geo::Shapefile.create!(
            title: form.title,
            description: form.description,
            shapefile: form.shapefile,
            organization: form.organization
          )
        end
      end
    end
  end
end
