# frozen_string_literal: true

module Decidim
  # This holds the decidim_geo version.
  module Geo
    def self.version
      "0.2.3"
    end

    def self.decidim_version
      [">= 0.26", "<0.28"].freeze
    end
  end
end
