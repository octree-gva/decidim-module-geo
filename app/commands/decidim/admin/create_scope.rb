# frozen_string_literal: true

module Decidim
  module Admin
    # A command with all the business logic when creating a static scope.
    class CreateScope < Decidim::Geo::Command
      # Public: Initializes the command.
      #
      # form - A form object with the params.
      # parent_scope - A parent scope for the scope to be created
      def initialize(form, parent_scope = nil)
        @form = form
        @parent_scope = parent_scope
      end

      # Executes the command. Broadcasts these events:
      #
      # - :ok when everything is valid.
      # - :invalid if the form wasn't valid and we couldn't proceed.
      #
      # Returns nothing.
      def call
        return broadcast(:invalid) if form.invalid?

        scope = create_scope
        broadcast(:ok, scope: scope)
      end

      private

      attr_reader :form

      def create_scope
        Decidim.traceability.create!(
          Scope,
          form.current_user,
          {
            name: form.name,
            organization: form.organization,
            code: form.code,
            scope_type: form.scope_type,
            parent: @parent_scope
          },
          extra: {
            parent_name: @parent_scope.try(:name),
            scope_type_name: form.scope_type.try(:name)
          }
        )
      end

      def shapedata
        Decidim::Geo::Shapedata.find_by(id: form.shapedata)
      end
    end
  end
end
