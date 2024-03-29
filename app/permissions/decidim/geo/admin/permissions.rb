# frozen_string_literal: true

module Decidim
  module Geo
    module Admin
      class Permissions < Decidim::DefaultPermissions
        def permissions
          return permission_action if permission_action.scope != :admin

          return permission_action unless user

          return permission_action if user.read_attribute("admin").blank?

          case permission_action.action
          when :create, :new, :update
            permission_action.allow!
          end

          permission_action
        end
      end
    end
  end
end
