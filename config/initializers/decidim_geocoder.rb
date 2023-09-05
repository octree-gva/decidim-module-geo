# Map and Geocoder configuration
# == OpenStreetMap (OSM) services ==
Decidim.configure do |config|
  config.maps = {
    provider: :osm,
    api_key: Rails.application.secrets.maps[:api_key],
    dynamic: {
      tile_layer: {
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        api_key: false,
        attribution: %(
          <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap</a> contributors
        ).strip
        # Translatable attribution:
        # attribution: -> { I18n.t("tile_layer_attribution") }
      }
    },
    # static: { url: "https://staticmap.example.org/" }, # optional
    geocoding: { host: "nominatim.openstreetmap.org", use_https: true },
    autocomplete: { url: "https://photon.komoot.io/api/" }
  }
end