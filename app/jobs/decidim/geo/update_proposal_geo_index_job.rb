# frozen_string_literal: true

module Decidim
  module Geo
    class UpdateProposalGeoIndexJob < ::ApplicationJob
      include Decidim::SanitizeHelper
      include Decidim::Geo::GeoIndexMethods
      queue_as :default

      alias proposal resource
      alias proposal= resource=

      def perform(proposal_id)
        @resource = Decidim::Proposals::Proposal.find(proposal_id)
        sync_proposal
      end

      private

      def sync_proposal
        return remove_proposal if remove_from_index?

        upsert_index(proposal.id, manifest_name,
                     with_scope(
                       with_coords(
                         resource_url: resource_url,
                         image_url: image_url,
                         title: title,
                         short_description: short_description,
                         description_html: description,
                         resource_status: proposal.state,
                         component_id: proposal.decidim_component_id,
                         participatory_space_id: proposal.participatory_space.id,
                         participatory_space_type: proposal.participatory_space.manifest.name.to_s
                       )
                     ))
        true
      rescue StandardError => e
        Rails.logger.debug { "Can index #{e}" }
        false
      end

      def start_date
        space_wrapper.start_date
      end

      def end_date
        space_wrapper.end_date
      end

      def space_wrapper
        @space_wrapper ||= Decidim::Geo::ResourceWrapper.new(proposal.space)
      end

      def remove_proposal
        match = Decidim::Geo::Index.find_by(resource_id: proposal.id, resource_type: manifest_name)
        match.destroy if match
      end

      def remove_from_index?
        !proposal.visible?
      end

      def manifest_name
        proposal.component.manifest_name.to_s
      end
    end
  end
  end
