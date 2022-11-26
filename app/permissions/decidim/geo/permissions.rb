# frozen_string_literal: true

module Decidim
  module Geo
    class Permissions < Decidim::DefaultPermissions
      def permissions
        return permission_action unless user

        return Decidim::Geo::Admin::Permissions.new(user, permission_action, context).permissions if permission_action.scope == :admin

        permission_action
      end
    end
  end
end
