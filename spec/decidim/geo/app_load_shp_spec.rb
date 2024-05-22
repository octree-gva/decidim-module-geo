# frozen_string_literal: true

# spec/app_load_shp_spec.rb

require "spec_helper"

module Decidim
  module Geo
    module LoadShp
      describe AppLoadShp do
        let(:shapefile) { double("shapefile", shapefile: double("path", path: "/path/to/shapefile.zip")) }
        let(:app_load_shp) { described_class.new(shapefile) }

        describe "#run!" do
          it "calls extract_file and shp_reader" do
            expect(app_load_shp).to receive(:extract_file)
            expect(app_load_shp).to receive(:shp_reader)

            app_load_shp.run!
          end
        end

        describe "#extract_file" do
          it "extracts the shapefile" do
            allow(Dir).to receive(:mktmpdir).and_yield("/tmpdir")
            allow(Zip::File).to receive(:open).and_yield(double("entry", name: "file.shp", extract: nil))

            expect(app_load_shp).to receive(:logger).twice.and_return(double("logger", debug: nil, error: nil))

            expect do
              app_load_shp.send(:extract_file, "/tmpdir")
            end.not_to raise_error
          end

          it "raises an error if extraction fails" do
            allow(Dir).to receive(:mktmpdir).and_yield("/tmpdir")
            allow(Zip::File).to receive(:open).and_raise(StandardError.new("Extraction failed"))

            expect(app_load_shp).to receive(:logger).twice.and_return(double("logger", debug: nil, error: nil))

            expect do
              app_load_shp.send(:extract_file, "/tmpdir")
            end.to raise_error(StandardError, "can not extract file.")
          end
        end

        describe "#shp_reader" do
          it "reads the shapefile and calls shp_loader" do
            allow(Dir).to receive(:glob).and_return(["/path/to/shapefile.shp"])
            allow(RGeo::Shapefile::Reader).to receive(:open).and_yield(double("file", num_records: 5, each: nil))
            allow(app_load_shp).to receive(:logger).and_return(double("logger", info: nil, error: nil))

            expect(app_load_shp).to receive(:shp_loader).exactly(5).times

            app_load_shp.send(:shp_reader, "/tmpdir")
          end

          it "raises an error if the shapefile is not found" do
            allow(Dir).to receive(:glob).and_return([])
            allow(app_load_shp).to receive(:logger).and_return(double("logger", info: nil, error: nil))

            expect do
              app_load_shp.send(:shp_reader, "/tmpdir")
            end.to raise_error(RuntimeError, "Shapefile doesn't exists")
          end

          it "raises an error if reading the shapefile fails" do
            allow(Dir).to receive(:glob).and_return(["/path/to/shapefile.shp"])
            allow(RGeo::Shapefile::Reader).to receive(:open).and_raise(StandardError.new("Reading failed"))
            allow(app_load_shp).to receive(:logger).and_return(double("logger", info: nil, error: nil))

            expect do
              app_load_shp.send(:shp_reader, "/tmpdir")
            end.to raise_error(StandardError, "Reading failed")
          end
        end

        describe "#shp_loader" do
          it "creates shapedatas with record data" do
            record = double("record", attributes: { key: "value" }, geometry: "geometry")
            allow(app_load_shp).to receive_message_chain(:@shapefile, :shapedatas, :create!)

            app_load_shp.send(:shp_loader, record)
          end
        end

        # Add more tests for other methods as needed

        describe "#logger" do
          it "returns Rails.logger" do
            expect(app_load_shp.send(:logger)).to eq Rails.logger
          end
        end

        describe "#now" do
          it "returns the current time in a specific format" do
            allow(Time).to receive(:new).and_return(Time.zone.local(2023, 10, 4, 12, 0, 0))
            expect(app_load_shp.send(:now)).to eq "2023-10-04_12-00-00"
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
end
