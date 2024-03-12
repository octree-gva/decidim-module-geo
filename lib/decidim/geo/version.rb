# frozen_string_literal: true

module Decidim
  # This holds the decidim-geo version.
  module Geo
    def self.version
      "0.1.1"
    end

    def self.decidim_version
      [">= 0.26","<0.28"].freeze
    end
  end
end
