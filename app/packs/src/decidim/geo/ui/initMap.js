import L from "leaflet";
import configStore from "../stores/configStore";
import "leaflet.fullscreen";
import { init as initMapTiler } from "@maptiler/leaflet-maptilersdk";
const initMap = async () => {
  const {
    mapID,
    map_config: { lat, lng, zoom, tile_layer, maptiler_api_key, maptiler_style_id },
    i18n
  } = configStore.getState();
  const map = L.map(mapID, {
    center: [lat, lng],
    zoom,
    scrollWheelZoom: false,
    fullscreenControl: false
  });

  map.zoomControl.setPosition("bottomright");

  if (maptiler_api_key.length > 0) {
    initMapTiler();
    new L.MaptilerLayer({
      style: maptiler_style_id,
      apiKey: maptiler_api_key
    }).addTo(map);
  } else {
    L.tileLayer(tile_layer, {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  }
  L.control
    .fullscreen({
      position: "topright",
      title: i18n["decidim.geo.mobile.open_fullscreen"],
      titleCancel: i18n["decidim.geo.mobile.close_fullscreen"],
      forceSeparateButton: true,
      forcePseudoFullscreen: true
    })
    .addTo(map);

  return { map };
};
export default initMap;
