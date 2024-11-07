# frozen_string_literal: true

module Decidim
  module Geo
    module GenericSerializer
      extend ActiveSupport::Concern

      included do
        attr_accessor :resource
        attr_accessor :resource_id

        def scope
          @scope ||= if resource.class.include? Decidim::HasComponent
                       scope_for_resource
                     elsif resource.instance_of?(Decidim::Component)
                       scope_for_component
                     elsif resource.class.include? Decidim::ScopableParticipatorySpace
                       scope_for_participatory_space
          end
        end

        def image_url
          @image_url ||= if resource.respond_to?(:banner_image)
                           resource.attached_uploader(:banner_image).url(only_path: true)
                         elsif resource.respond_to?(:attachments) && resource.attachments.first
                           resource.attachments.first.url
          end
        end

        def start_date
          @start_date ||= if resource.respond_to?(:start_time)
            resource.start_time.to_date
          elsif resource.respond_to?(:start_date)
            resource.start_date
          end

        end

        def end_date
          @end_date ||= if resource.respond_to?(:end_time)
            resource.end_time.to_date
          elsif resource.respond_to?(:end_date)
            resource.end_date
          end
        end

        def resource_url
          @resource_url ||= Decidim::ResourceLocatorPresenter.new(resource).path
        end

        def title
          @title ||= if resource.respond_to?(:title)
                       resource.title
                     elsif resource.respond_to?(:name)
                       resource.name
          end
        end

        def short_description
          if resource.respond_to?(:short_description)
            truncate_translated(resource.short_description, 250)
          elsif resource.respond_to?(:body)
            truncate_translated(resource.body, 250)
          elsif resource.respond_to?(:description)
            truncate_translated(resource.description, 250)
          end
        end

        def description
          @description ||= if resource.respond_to?(:body)
                             truncate_translated(resource.body, keep_html: true)
                           elsif resource.respond_to?(:description)
                             truncate_translated(resource.description, keep_html: true)
          end
        end

        def latitude
          @latitude ||= if location_overriden?
                          location.latitude if location && location.latitude
                        else
                          resource.latitude
          end
        end

        def longitude
          @longitude ||= if location_overriden?
                           location.longitude if location && location.longitude
                         else
                           resource.longitude
          end
        end

        def location
          @location ||= resource.decidim_geo_space_location
        end

        def location_overriden?
          @location_overriden ||= resource.respond_to?(:decidim_geo_space_location)
        end

        private

        def truncate_translated(value_param, chars = 1000, **options)
          sanitizer = options[:keep_html] ? Rails::Html::SafeListSanitizer.new : Rails::Html::FullSanitizer.new
          value = value_param.deep_dup
          value.each do |key, v|
            value[key] = if v.is_a?(Hash)
                           truncate_translated(v, chars, options)
                         else
                           sanitizer.sanitize(
                             Decidim::HtmlTruncation.new(
                               Decidim::ContentProcessor.render(
                                 v
                               ),
                               max_length: chars,
                               tail: "…",
                               count_tags: false,
                               count_tail: false,
                               tail_before_final_tag: false
                             ).perform
                           )
                        end
          end
          value
        end

        def scope_for_participatory_space(space = nil)
          space ||= resource

          @scope_for_participatory_space ||= (space.scope if space && space.scope)
        end

        def scope_for_component(component = nil)
          component ||= resource
          @scope_for_component ||= if component && component.scope
                                     component.scope
                                   else
                                     scope_for_participatory_space(component.participatory_space)
          end
        end

        def scope_for_resource
          @scope_for_resource ||= resource.scope.presence || scope_for_component(resource.component)
        end
      end
    end
  end
end
