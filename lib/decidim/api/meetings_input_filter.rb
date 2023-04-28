# frozen_string_literal: true

module Decidim
  module Meetings
    class MeetingsInputFilter < Decidim::Core::BaseInputFilter
      include Decidim::Core::HasPublishableInputFilter
      include Decidim::Core::HasHastaggableInputFilter
      include Decidim::Geo::HasScopeableInputFilter

      graphql_name "MeetingsFilter"
      description "A type used for filtering meetings"
    end
  end
end
