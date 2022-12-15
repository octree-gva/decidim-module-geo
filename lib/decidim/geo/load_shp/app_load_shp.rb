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
            logger.debug "Extract shapefile in tmp dir '#{dir}'"
            extract_file(dir)
            shp_loader(dir)
          end
        end

        private

          def extract_file(dir)
            exec_command! "unzip #{@shapefile.shapefile.path} -d #{dir}"
          rescue Exception => e
            logger.error "can not extract file."
            logger.error e.message
            raise e
          end

          def shp_loader(dir)
            shp_file = Dir.glob("#{dir}/**/*.shp")
            logger.info "Shapefile exists ? #{shp_file}"
            raise "Shapefile doesn't exists" if shp_file.empty?

            table_name = "decidim_geo_#{@shapefile.title.downcase.gsub(' ', '_')}"
            with_pg_pass do
              logger.debug "Running shp2pgsql"
              db_host = ENV.fetch("DATABASE_HOST")
              db_user = ENV.fetch("DATABASE_USERNAME")
              db_name = ENV.fetch("DATABASE_NAME")

              exec_command!("shp2pgsql -c -I -s #{shp_file.first} \ 
                public.#{table_name} | psql -h #{db_host} -d #{db_name} -U #{db_user} -w")

              logger.info "⚙️ shape table name: #{table_name}"
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
