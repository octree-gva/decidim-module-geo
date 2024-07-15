import configStore from "../models/configStore";
import "leaflet.fullscreen";

const initMap = async () => {
  const {
    mapID,
    map_config: { lat, lng, zoom, tile_layer },
    i18n
  } = configStore.getState();
  const map = L.map(mapID, {
    center: [lat, lng],
    zoom,
    scrollWheelZoom: false,
    fullscreenControl: false
  });

  map.zoomControl.setPosition("bottomright");

  const tile = L.tileLayer(tile_layer, {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  L.control
    .fullscreen({
      position: "topright",
      title: i18n["decidim.geo.mobile.open_fullscreen"],
      titleCancel: i18n["decidim.geo.mobile.close_fullscreen"],
      forceSeparateButton: true,
      forcePseudoFullscreen: true
    })
    .addTo(map);

  return {map, tile};
};
export default initMap;
