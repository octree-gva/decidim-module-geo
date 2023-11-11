Deface::Override.new(:virtual_path => 'decidim/meetings/meetings/index',
                     :name => "remove_meeting_map_statement",
                     :remove => "erb[silent]:contains('current_component.settings.maps_enabled? && search.results.not_online.exists?')",
                     :closing_selector => "erb[silent]:contains('end')")

Deface::Override.new(:virtual_path => 'decidim/proposals/proposals/index',
                     :name => "remove_proposal_map_statement",
                     :remove => "erb[silent]:contains('if component_settings.geocoding_enabled?')",
                     :closing_selector => "erb[silent]:contains('end')")
