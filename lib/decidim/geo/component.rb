# frozen_string_literal: true

require_dependency 'decidim/components/namer'

Decidim.register_component(:geo) do |component|
  component.engine = Decidim::Geo::Engine
  component.admin_engine = Decidim::Geo::AdminEngine
  component.icon = 'decidim/geo/icon.svg'

  component.settings(:global) do |settings|
    settings.attribute :announcement, type: :text, translated: true, editor: true
  end

  component.settings(:step) do |settings|
    settings.attribute :announcement, type: :text, translated: true, editor: true
  end
end
