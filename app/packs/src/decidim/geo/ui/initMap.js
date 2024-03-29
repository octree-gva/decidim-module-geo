import configStore from "../models/configStore";
const initMap = async () => {
  const {
    mapID,
    map_config: { lat, lng, zoom, tile_layer }
  } = configStore.getState();
  const map = L.map(mapID, {
    center: [lat, lng],
    zoom,
    scrollWheelZoom: false
  });
  map.zoomControl.setPosition("topright");

  L.tileLayer(tile_layer, {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  return map;
};
export default initMap;
