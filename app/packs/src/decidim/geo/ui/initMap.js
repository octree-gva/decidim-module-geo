const { getGeoConfig } = require("../api");

const initMap = async () => {
  const { lat, lng, zoom } = await getGeoConfig();

  const map = L.map("map", { center: [lat, lng], zoom });
  map.zoomControl.setPosition("topright");

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
  ).addTo(map);

  return map;
};
export default initMap;
