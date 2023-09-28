raise "Can not create organization, already exists one" if Decidim::Organization.count > 0
# Create an organization for localhost
organization = ::Decidim::Organization.create!(
    host: "127.0.0.1",
    name: "Decidim GEO",
    default_locale: "fr",
    available_locales: ["en", "fr"],
    reference_prefix: "GEO",
    available_authorizations: [],
    users_registration_mode: :enabled,
    tos_version: Time.current,
    badges_enabled: true,
    user_groups_enabled: true,
    send_welcome_notification: true,
    file_upload_settings: ::Decidim::OrganizationSettings.default(:upload)
)

::Decidim::System::CreateDefaultPages.call(organization)
::Decidim::System::PopulateHelp.call(organization)
::Decidim::System::CreateDefaultContentBlocks.call(organization)

# Create an admin user with the same system admin creds
organization = Decidim::Organization.first
::Decidim::User.create!(
    email: ENV.fetch("DECIDIM_SYSTEM_EMAIL"),
    name: "Admin User",
    nickname: "admin",
    password: ENV.fetch("DECIDIM_SYSTEM_PASSWORD"),
    password_confirmation:  ENV.fetch("DECIDIM_SYSTEM_PASSWORD"),
    organization: organization,
    confirmed_at: Time.current,
    locale: organization.default_locale,
    admin: true,
    tos_agreement: true,
    personal_url: "",
    about: "",
    accepted_tos_version: organization.tos_version,
    admin_terms_accepted_at: Time.current
)
