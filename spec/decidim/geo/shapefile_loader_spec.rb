# frozen_string_literal: true

# spec/app_load_shp_spec.rb

require "spec_helper"

module Decidim
  module Geo
    describe ShapefileLoader do
      let(:shapefile) { double("shapefile", shapefile: double("path", path: "/path/to/shapefile.zip")) }
      let(:app_load_shp) { described_class.new(shapefile) }

      describe "#run!" do
        it "calls extract_file and shp_reader" do
          expect(app_load_shp).to receive(:extract_file)
          expect(app_load_shp).to receive(:shp_reader)

          app_load_shp.run!
        end
      end

      describe "#shp_reader" do
        it "raises an error if reading the shapefile fails" do
          allow(Dir).to receive(:glob).and_return(["/path/to/shapefile.shp"])
          allow(RGeo::Shapefile::Reader).to receive(:open).and_raise(StandardError.new("Reading failed"))
          allow(app_load_shp).to receive(:logger).and_return(double("logger", info: nil, error: nil))

          expect do
            app_load_shp.send(:shp_reader, "/tmpdir")
          end.to raise_error(StandardError, "Reading failed")
        end
      end

      describe "#logger" do
        it "returns Rails.logger" do
          expect(app_load_shp.send(:logger)).to eq Rails.logger
        end
      end

      describe "#uploads_path" do
        it "returns the path to the uploads directory" do
          allow(ENV).to receive(:fetch).with("RAILS_ROOT").and_return("/rails/root")
          expect(app_load_shp.send(:uploads_path)).to eq "/rails/root/public/uploads"
        end
      end

      describe "#logs_path" do
        it "returns the path to the logs directory" do
          allow(ENV).to receive(:fetch).with("RAILS_ROOT").and_return("/rails/root")
          expect(app_load_shp.send(:logs_path)).to eq "/rails/root/log"
        end
      end
    end
  end
end
