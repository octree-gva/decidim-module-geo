const {
  getParticipatoryProcesses,
  getGeoShapefiles,
  getGeoJSON,
} = require("./api");
const { participatoryProcess } = require("./models");
const {
  initMap,
  createNestedControls,
  createCustomLayerControl,
} = require("./ui");

async function main() {
  const map = await initMap();

  createNestedControls(map, {
    label: "processes",
    data: await getParticipatoryProcesses(),
    getSubGroupName: ({ title: { translation } }) => translation,
    getNodes: participatoryProcess.getNodes,
    formatMarkerDataReducers: {
      title: ({ title: { translation } }) => translation,
      description: ({ description: { translation } }) => translation,
      location: ({ coordinates: { latitude, longitude } }) => {
        if (latitude && longitude) return [latitude, longitude];
      },
      image: ({ entity }) => entity.bannerImage,
      href: ({ id, entity }) =>
        `/processes/${entity.slug}/f/${entity.components[0].id}/meetings/${id}`,
    },
  });

  const areasGeojsonFeature = await getGeoJSON(
    "/uploads/shapefiles/suisse_quartiers.zip"
  );
  const areasLayer = L.geoJSON(areasGeojsonFeature);
  createCustomLayerControl(map, {
    label: "areas",
    layer: areasLayer,
  });

  const shapefiles = await getGeoShapefiles();
  shapefiles.forEach(async shapefileElement => {
    const geojsonFeature = await getGeoJSON(shapefileElement.shapefile);
    const shapefileLayer = L.geoJSON(geojsonFeature);
    createCustomLayerControl(map, {
      label: shapefileElement.title,
      layer: shapefileLayer,
    });
  });
}

main();
