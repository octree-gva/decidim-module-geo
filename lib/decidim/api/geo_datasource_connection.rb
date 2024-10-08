# frozen_string_literal: true

module Decidim
  module Geo
    class GeoDatasourceConnection < GraphQL::Pagination::Connection
      attr_accessor :selected_attributes

      def cursor_for(item)
        return nil unless item

        item.id
      end

      def page_size
        @first_value || max_page_size
      end

      def nodes
        @finished = false
        (search_results, finished) = Rails.cache.fetch(cache_key) do
          paginated_result = if @after_value
                               @items.where(@items.arel_table[:id].gt(@after_value))
                             else
                               @items
          end
          last = @items.select(:id).reorder(id: :asc).last
          last_id = last.id
          paginated_result = paginated_result.select(selected_attributes).reorder(id: :asc).limit(page_size)
          [
            paginated_result,
            !last || paginated_result.last.id == last_id
          ]
        end
        @finished = finished
        search_results
      end

      def from_cursor(cursor)
        cursor || 0
      end

      def has_next_page
        !@finished
      end

      # Always return false because we're not implementing backwards pagination
      def has_previous_page
        false
      end

      private

      def cache_key
        @cache_key ||= begin
          args_without_lookahead = arguments.reject { |key| key == :lookahead }
          prefix = "geo_datasource/#{Digest::MD5.hexdigest(args_without_lookahead.to_json)}/#{Digest::MD5.hexdigest(selected_attributes.to_json)}"
          last_updated = Decidim::Geo::Index.maximum(:updated_at)
          "#{prefix}/#{last_updated.to_i}"
        end
      end
    end
  end
end
