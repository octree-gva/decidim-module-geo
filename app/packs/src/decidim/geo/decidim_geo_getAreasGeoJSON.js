//polyfill for shpjs
global.Buffer = global.Buffer || require("buffer").Buffer;
const shp = require("shpjs");

async function getAreasGeoJSON(url) {
  return await window
    .fetch(url)
    .then(response => response.arrayBuffer())
    .then(shp)
    .catch(alert);
}

export default getAreasGeoJSON;
