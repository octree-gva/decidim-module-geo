module Decidim
  module Geo
    class ShapefileUploader < ::Decidim::ApplicationUploader

      def extension_allowlist
        %w(zip)
      end

      def size_range
        0..10.megabytes
      end
    end
  end
end
