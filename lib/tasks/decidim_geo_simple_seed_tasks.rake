# frozen_string_literal: true

require "decidim/gem_manager"

namespace :decidim_geo do
  desc "Creates organization and admin users"
  task seed: :environment do

    organization = Decidim::Organization.first || Decidim::Organization.create!(
      name: "Decidim Geo Demo",
      host: ENV.fetch("DECIDIM_HOST", "localhost"),
      secondary_hosts: ENV.fetch("DECIDIM_HOST", "localhost") == "localhost" ? ["0.0.0.0", "127.0.0.1"] : nil,
      external_domain_whitelist: ["decidim.org", "github.com"],
      default_locale: Decidim.default_locale,
      available_locales: Decidim.available_locales,
      reference_prefix: ::Faker::Name.suffix,
      available_authorizations: Decidim.authorization_workflows.map(&:name),
      users_registration_mode: :enabled,
      tos_version: Time.current,
      badges_enabled: true,
      user_groups_enabled: true,
      send_welcome_notification: true,
      file_upload_settings: Decidim::OrganizationSettings.default(:upload)
    )

    admin = Decidim::User.find_or_initialize_by(email: "admin@example.org")
    admin_hash = {
      name: ::Faker::Name.name,
      nickname: ::Faker::Twitter.unique.screen_name,
      organization:organization,
      confirmed_at: Time.current,
      locale: I18n.default_locale,
      admin: true,
      tos_agreement: true,
      personal_url: ::Faker::Internet.url,
      about: ::Faker::Lorem.paragraph(sentence_count: 2),
      accepted_tos_version: organization.tos_version + 1.hour,
      newsletter_notifications_at: Time.current,
      password_updated_at: Time.current,
      admin_terms_accepted_at: Time.current
    }
    admin_hash.merge!(password: "decidim123456789") if admin.encrypted_password.blank?
    admin.update!(admin_hash)

    Decidim::System::CreateDefaultContentBlocks.call(organization)
  end
end
