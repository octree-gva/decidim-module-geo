//polyfill for shpjs
global.Buffer = global.Buffer || require("buffer").Buffer;
const shp = require("shpjs");

async function getAreasGeoJSON() {
  return await window
    .fetch(`/uploads/shapefiles/shapefile.zip`)
    .then(response => response.arrayBuffer())
    .then(shp)
    .catch(alert);
}

export default getAreasGeoJSON;
