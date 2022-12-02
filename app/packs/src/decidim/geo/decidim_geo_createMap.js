const utils = require("./decidim_geo_utils.js");
const queries = require("./decidim_geo_queries");
const {
  default: createNestedControls,
} = require("./decidim_geo_createNestedControls.js");
const {
  default: createCustomLayerControl,
} = require("./decidim_geo_createCustomLayerControl.js");
const {
  default: getAreasGeoJSON,
} = require("./decidim_geo_getAreasGeoJSON.js");

async function createMap() {
  const map = L.map("map", { center: [46.521297, 6.632541], zoom: 14 });
  map.zoomControl.setPosition("topright");

  const osm = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
  ).addTo(map);

  const {
    data: { participatoryProcesses },
  } = await utils.getDecidimData(queries.participatoryProcessesQuery);
  createNestedControls(map, {
    label: "processes",
    data: participatoryProcesses,
    getSubGroupName: ({ title: { translation } }) => translation,
    getNodes: utils.getParticipatoryProcessesNodes,
    formatMarkerDataReducers: {
      description: ({ description: { translation } }) => translation,
      location: ({ coordinates: { latitude, longitude } }) => {
        if (latitude && longitude) return [latitude, longitude];
      },
      href: () => "/test",
    },
  });

  const geojsonFeature = await getAreasGeoJSON();
  const areasLayer = L.geoJSON(geojsonFeature);
  createCustomLayerControl(map, {
    label: "areas",
    layer: areasLayer,
  });
}

createMap();
