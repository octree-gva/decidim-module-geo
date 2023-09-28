# frozen_string_literal: true

module Decidim
  module Geo
    module LoadShp
      class AppLoadShp
        def initialize(shapefile)
          logger.info "⚙️ starts shapefile loader (##{now})"
          @shapefile = shapefile
        end

        def run!
          Dir.mktmpdir do |dir|
            extract_file(dir)
            shp_reader(dir)
          end
        end

        private

          def extract_file(dir)
            logger.debug "Extract shapefile in tmp dir '#{dir}'"
            Zip::File.open(@shapefile.shapefile.path) do |zip_file|
              zip_file.each do |entry|
                logger.debug "Extracting #{entry.name}"
                entry.extract(File.join(dir,entry.name))
              end
            end
          rescue Exception => e
            logger.error "can not extract file."
            logger.error e.message
            raise e
          end

          def shp_reader(dir)
            shp_file = Dir.glob("#{dir}/**/*.shp")
            logger.info "Shapefile exists ? #{shp_file}"
            raise "Shapefile doesn't exists" if shp_file.empty?
            
            RGeo::Shapefile::Reader.open(shp_file.first, srid: 2056) do |file|
              logger.info "File contains #{file.num_records} records."
              
              file.each do |record|
                shp_loader(record)
              end
            rescue Exception => e
              logger.error e.message
              raise e
            end
          end

          def shp_loader(record)
            data = record.attributes
            @shapefile.shapedatas.create!(data: data, geom: record.geometry)
          end

          ##
          # Define logger for the class.
          def logger
            @logger ||= Rails.logger
          end

          ##
          # Time at the start of the backup task
          def now
            @now ||= Time.new.strftime("%Y-%m-%d_%H-%M-%S")
          end

          ##
          # Directory where the user's uploads are.
          def uploads_path
            @uploads_path ||= "#{ENV.fetch('RAILS_ROOT')}/public/uploads"
          end

          ##
          # Directory where the app's logs are.
          def logs_path
            @logs_path ||= "#{ENV.fetch('RAILS_ROOT')}/log"
          end
      end
    end
  end
end
