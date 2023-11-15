Deface::Override.new(:virtual_path => "decidim/meetings/meetings/index",
                     :name => "remove_default_meetings_map",
                     :remove => "erb[silent]:contains('if current_component.settings.maps_enabled? && search.result.not_online.exists?')",
                     :closing_selector => "erb[silent]:contains('end')")
