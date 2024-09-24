# frozen_string_literal: true

module Decidim
  module Geo
    class GeoDatasourceConnection < GraphQL::Pagination::Connection
      def cursor_for(item)
        return nil if item.nil?

        Base64.strict_encode64("#{item.model_name}##{item.id}")
      end

      def page_size
        @first_value || max_page_size
      end

      def results
        @finished = false
        (search_results, finished) = Rails.cache.fetch(resource_cache_key, expires_in: 12.hours) do
          finished = false
          search_results = []
          result_count = 0
          last_cursor = from_cursor(@after_value)
          current_model_index = @items.find_index do |filter, _query|
            filter.model_klass == last_cursor.first
          end || 0
          last_id = last_cursor.last
          while result_count < page_size && current_model_index < @items.size
            resource_limit = page_size - result_count
            resource = @items[current_model_index]
            filter = filter_for(resource)
            query = query_for(resource).where(filter.search_context.arel_table[:id].gt(last_id)).limit(resource_limit)
            query_count = query.count
            query_array = query.to_a
            result_count += query_count
            search_results.concat(query_array)

            next unless query_count < resource_limit

            current_model_index += 1
            last_id = -1
            if current_model_index == @items.size
              finished = true
              return search_results
            end
          end
          [search_results, finished]
        end
        @finished = finished
        search_results
      end

      def total_result_count
        @total_result_count ||= @items.map do |_filter, query|
          query.count
        end.sum
      end

      def from_cursor(encoded_cursor)
        return [0, -1] unless encoded_cursor

        matches = Base64.strict_decode64(encoded_cursor).split("#")
        [
          matches.first,
          matches.last.to_i
        ]
      end

      def filter_for(item)
        item.first
      end

      def query_for(item)
        item.last
      end

      def nodes
        results
      end

      def has_next_page
        return total_result_count > page_size unless after_value

        last_cursor = cursor_for(@items.select { |_f, query| query.exists? }.last.last.last)
        after_value != last_cursor && !@finished
      end

      # Always return false because we're not implementing backwards pagination
      def has_previous_page
        false
      end

      private

      def resource_cache_key
        @resource_cache_key ||= begin
          cache_key = "geo_datasource/#{Digest::MD5.hexdigest(arguments.to_json)}/#{(context[:current_user] && context[:current_user].id) || 0}"
          last_updated = [
            Decidim::Component.maximum(:updated_at),
            supported_filters.map do |filter|
              filter.maximum(:updated_at) || 1.year.from_now
            end.max
          ].max
          "#{cache_key}/#{last_updated.to_i}"
        end
      end

      def supported_filters
        @supported_filters ||= ::Decidim::Geo.config.supported_filters.map do |filter|
          filter.constantize.new(self).klass
        end
      end
    end
  end
end
