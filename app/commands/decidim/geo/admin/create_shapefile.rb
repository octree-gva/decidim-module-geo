# frozen_string_literal: true

module Decidim
  module Geo
    module Admin
    # A command with all the business logic when a user creates a new proposal.
      class CreateShapefile < Rectify::Command
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

          transaction do
            create_shapefile
          end

          broadcast(:ok, @shapefile)
        end

        private

        attr_reader :form

        def create_shapefile
          form.shapefile.original_filename = "shapefile.zip"
          @shapefile = Decidim::Geo::Shapefile.create!(
            title: form.title,
            description: form.description,
            shapefile: form.shapefile
          )
        end

      end
    end
  end
end
