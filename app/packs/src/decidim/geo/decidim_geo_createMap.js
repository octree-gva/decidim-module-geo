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
      title: ({ title: { translation } }) => translation,
      description: ({ description: { translation } }) => translation,
      location: ({ coordinates: { latitude, longitude } }) => {
        if (latitude && longitude) return [latitude, longitude];
      },
      href: ({ id, entity }) =>
        `/processes/${entity.slug}/f/${entity.components[0].id}/meetings/${id}`,
    },
  });

  const areasGeojsonFeature = await getAreasGeoJSON(
    "/uploads/shapefiles/shapefile.zip"
  );
  const areasLayer = L.geoJSON(areasGeojsonFeature);
  createCustomLayerControl(map, {
    label: "areas",
    layer: areasLayer,
  });

  const {
    data: { shapefiles },
  } = await utils.getDecidimData(queries.shapefilesQuery);

  shapefiles.forEach(async shapefileElement => {
    const geojsonFeature = await getAreasGeoJSON(shapefileElement.shapefile);
    const shapefileLayer = L.geoJSON(geojsonFeature);
    createCustomLayerControl(map, {
      label: shapefileElement.title,
      layer: shapefileLayer,
    });
  });
}

createMap();
