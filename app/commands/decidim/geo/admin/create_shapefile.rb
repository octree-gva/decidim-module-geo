# frozen_string_literal: true

module Decidim
  module Geo
    module Admin
    # A command with all the business logic when a user creates a new proposal.
      class CreateShapefile < Rectify::Command
        include ::Decidim::AttachmentMethods

        # Public: Initializes the command.
        #
        # form - A form object with the params.
        def initialize(form)
          @form = form
        end

        # Executes the command. Broadcasts these events:
        #
        # - :ok when everything is valid, together with the proposal.
        # - :invalid if the form wasn't valid and we couldn't proceed.
        #
        # Returns nothing.
        def call
          return broadcast(:invalid) if form.invalid?

          if process_attachments?
            build_attachment
            return broadcast(:invalid) if attachment_invalid?
          end

          transaction do
            create_shapefile
            create_attachment if process_attachments?
            send_notification
          end

          broadcast(:ok, proposal)
        end

        private

        attr_reader :form, :shapefile, :attachment

        def create_shapefile
          @shapefile = Decidim::Geo::Shapefile.new(attributes)
          @shapefile.save!
          @shapefile
        end

        def attributes
          parsed_title = Decidim::ContentProcessor.parse_with_processor(:hashtag, form.title, current_organization: form.current_organization).rewrite
          {
            title: parsed_title
          }
        end

        def send_notification
          Decidim::EventsManager.publish(
            event: "decidim.events.proposals.proposal_published",
            event_class: Decidim::Proposals::PublishProposalEvent,
            resource: shapefile,
          )
        end
      end
    end
  end
end
