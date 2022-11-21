module Decidim
  module Geo
    class ShapefileUploader < Decidim::Cw::ApplicationUploader

      def store_dir
        default_path = "uploads/shapefiles"
  
        return File.join(Decidim.base_uploads_path, default_path) if Decidim.base_uploads_path.present?
  
        default_path
      end

      def extension_allowlist
        %w(zip)
      end

      def size_range
        0..10.megabytes
      end

    end
  end
end
