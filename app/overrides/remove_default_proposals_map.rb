Deface::Override.new(:virtual_path => "decidim/proposals/proposals/index",
                     :name => "remove_default_proposals_map",
                     :remove => "erb[loud]:contains('dynamic_map_for proposals_data_for_map(@all_geocoded_proposals) do')",
                     :closing_selector => "erb[silent]:contains('end')")
