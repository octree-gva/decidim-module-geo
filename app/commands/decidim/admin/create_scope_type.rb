# frozen_string_literal: true

module Decidim
  module Admin
    # A command with all the business logic when creating a scope type.
    class CreateScopeType < Decidim::Geo::Command
      # Public: Initializes the command.
      #
      # form - A form object with the params.
      def initialize(form, user = nil)
        @form = form
        @user = user
      end

      # Executes the command. Broadcasts these events:
      #
      # - :ok when everything is valid.
      # - :invalid if the form wasn't valid and we couldn't proceed.
      #
      # Returns nothing.
      def call
        return broadcast(:invalid) if form.invalid?

        create_scope_type
        broadcast(:ok)
      end

      private

      attr_reader :form

      def create_scope_type
        scope_type = ScopeType.create!(
          name: form.name,
          organization: form.organization,
          plural: form.plural
        )
        scope_type.shapefile = shapefile
        scope_type.save!
      end

      def shapefile
        Decidim::Geo::Shapefile.find_by(id: form.shapefile)
      end
    end
  end
end
