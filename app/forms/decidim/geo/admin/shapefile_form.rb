# frozen_string_literal: true

module Decidim
  module Geo
    module Admin
      # A form object to be used when admin users want to upload a shapefile.
      class ShapefileForm < Decidim::AttachmentForm
        include Decidim::TranslatableAttributes
        include Decidim::AttachmentAttributes
        include Decidim::HasUploadValidations
        include Decidim::ApplicationHelper

        mimic :shapefile 

        attribute :attachment, AttachmentForm

        validate :notify_missing_attachment_if_errored

        def map_model(model)
          super(model)
          
          self.attachment = if model.attachments.first.present?
                              { file: model.attachments.first.file, title: translated_attribute(model.attachments.first.title) }
                            else
                              {}
                            end
        end

        private

        # This method will add an error to the `attachment` field only if there's
        # any error in any other field. This is needed because when the form has
        # an error, the attachment is lost, so we need a way to inform the user of
        # this problem.
        def notify_missing_attachment_if_errored
          errors.add(:attachment, :needs_to_be_reattached) if errors.any? && attachment.present?
        end

      end
    end
  end
end
