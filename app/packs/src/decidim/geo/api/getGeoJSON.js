//polyfill for shpjs
global.Buffer = global.Buffer || require("buffer").Buffer;
const shp = require("shpjs");

async function getGeoJSON(shapefileUrl) {
  return await window
    .fetch(shapefileUrl)
    .then(response => response.arrayBuffer())
    .then(shp)
    .catch(alert);
}

export default getGeoJSON;
