# frozen_string_literal: true

module Decidim
  module Geo
    class Shp2pgsql
      def initialize(shapefile)
        logger.info "⚙️ starts shapefile loader (##{now})"
        @shapefile = shapefile
      end

      def run!
        Dir.mktmpdir do |dir|
          logger.debug "Extract shapefile in tmp dir '#{dir}'"
          extract_file(dir)
          shp2pgsql_loader(dir)
        end
      end

      private

        def extract_file(dir)
          
        end
        ##
        # Generates a metadata.json file that will be included in the
        # given dir. Give information about date, instance identification,
        # timezone and decidim version.
        # @returns [String] the filename of the generate file
        def generate_metadatas(dir)
          filename = "#{dir}/metadatas.json"
          metadatas = {
            date: now,
            decidim_version: ENV.fetch("DECIDIM_VERSION", nil),
            instance_uuid: ENV.fetch("INSTANCE_UUID", nil),
            timezone: ENV.fetch("TZ", nil),
          }
          File.open(filename, "w") do |f|
            f.write(JSON.pretty_generate(metadatas))
          end
          filename
        end

        ##
        # Compress a directory in a tar.gz file.
        def compress_source_path(source_path, destination_dir)
          logger.debug "Running compress_dir for #{source_path}"
          source_path_name = File.basename(source_path)
          compressed_file = "#{destination_dir}/#{source_path_name}-#{now}.tar.gz"
          compress_tar!("#{source_path}/", "#{compressed_file}")
          logger.info "⚙️ backup #{source_path_name}: #{compressed_file}"
          compressed_file
        rescue Exception => e
          logger.error e.message
          raise e
        end

        ##
        # Dump the posgres database.
        def dump_database(destination_dir)
          with_pg_pass do
            logger.debug "Running dump_database"
            db_host = ENV.fetch("DATABASE_HOST")
            db_user = ENV.fetch("DATABASE_USERNAME")
            db_pass = ENV.fetch("DATABASE_PASSWORD")
            db_name = ENV.fetch("DATABASE_DATABASE")

            dump_file = "#{destination_dir}/#{db_name}-#{now}.dump"
            exec_command!("pg_dump -Fc \
          -d #{db_name} -h #{db_host} -U #{db_user} -w \
          -f #{dump_file}")

            logger.info "⚙️ backup db: #{dump_file}"
            dump_file
          rescue Exception => e
            logger.error e.message
            raise e
          end
        end

        ##
        # Create if not exists a .pgpass file.
        # Needed to be able to use pg_dump from this image.
        def with_pg_pass(&block)
          # Check /root/.pgpass exists if not create it
          File.open("/root/.pgpass", "w") do |f|
            db_host = ENV.fetch("DATABASE_HOST")
            db_user = ENV.fetch("DATABASE_USERNAME")
            db_pass = ENV.fetch("DATABASE_PASSWORD")
            db_name = ENV.fetch("DATABASE_DATABASE")
            f.write("#{db_host}:*:#{db_name}:#{db_user}:#{db_pass}")
            f.chmod(0600)
          end unless File.exists?("/root/.pgpass")
          block.call()
        end

        ##
        # exec a system command.
        def exec_command!(command)
          logger.debug "exec '#{command}'"
          command_output = system(command)
          if command_output == true
            logger.debug "exec worked: #{command}"
          else
            raise "exec failed: #{command}"
          end
        rescue Exception => e
          logger.error e.message
          raise e
        end

        ##
        # Ensure backup directory exists and then run the given block with
        # backup directory path as argument.
        def with_backup_dir(&block)
          @backup_dir ||= "#{ENV.fetch('RAILS_ROOT')}/decidim-module-voca/backup_dir"
          backup_dir = @backup_dir
          Dir.mkdir(backup_dir) unless Dir.exists?(backup_dir)
          if Dir.exists?(backup_dir)
            block.call(backup_dir)
          else
            raise "Fails to create #{backup_dir}"
          end
        end

        ##
        # tar a source directory into a destination file.
        # the compressed file will have the source directory content only
        def compress_tar!(source, destination)
          exec_command! "tar -czf #{destination} . -C #{source}"
        rescue Exception => e
          logger.error "can not tar file."
          logger.error e.message
          raise e
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
