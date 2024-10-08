require 'singleton'
module Decidim
    module Geo
        class ManifestRegistry
            include Singleton
            
            def registered_manifests
                @_registration_manifest.keys
            end

            def active_manifests
                yield(@_registration_manifest.select {|_k, v| v[:enabled] }) if block_given?
            end

            def model_for(manifest)
                raise "unknown manifest: #{manifest}" unless @_registration_manifest.key? manifest
                @_registration_manifest[manifest][:model]
            end

            def updater_for(manifest)
                raise "unknown manifest: #{manifest}" unless @_registration_manifest.key? manifest
                @_registration_manifest[manifest][:updater]
            end

            def time_filter_for(manifest)
                raise "unknown manifest: #{manifest}" unless @_registration_manifest.key? manifest
                @_registration_manifest[manifest][:time_filter]
            end

            def register(manifest_name, time_filter:, model: , updater:)
                @_registration_manifest[manifest_name.to_s] = {
                    time_filter: time_filter,
                    model: model,
                    updater: updater,
                    enabled: false
                }
            end

            def enable(*manifest_names)
                manifest_names_options = manifest_names.map {|name| "#{name}"}
                @_registration_manifest.each do |manifest, config|
                    config[:enabled] = manifest_names_options.include? manifest
                end
            end

            def enabled?(manifest_name)
                manifest = "#{manifest_name}".to_sym
                @_registration_manifest.key? manifest
            end
            private

            def initialize
              @_registration_manifest = {}.with_indifferent_access
            end
        end
    end
end