# frozen_string_literal: true

module Decidim
  module Admin
    # A command with all the business logic when updating a scope type.
    class UpdateScopeType < Decidim::Geo::Command
      # Public: Initializes the command.
      #
      # scope_type - The ScopeType to update
      # form - A form object with the params.
      # current_user - nil for compatibility with 0.26
      def initialize(scope_type, form, user = nil)
        @scope_type = scope_type
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

        update_scope_type
        broadcast(:ok)
      end

      private

      attr_reader :form

      def update_scope_type
        @scope_type.shapefile = shapefile
        @scope_type.save!
        @scope_type.update!(attributes)
        traceability_update
      end

      def traceability_update
        Decidim.traceability.update!(
          @scope_type,
          @user,
          attributes
        )
      end

      def shapefile
        Decidim::Geo::Shapefile.find_by(id: form.shapefile)
      end

      def attributes
        {
          name: form.name,
          plural: form.plural
        }
      end
    end
  end
end
