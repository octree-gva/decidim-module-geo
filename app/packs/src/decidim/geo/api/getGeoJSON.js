//polyfill for shpjs
global.Buffer = global.Buffer || require("buffer").Buffer;
const shp = require("shpjs");

async function getGeoJSON(shapefileUrl) {
  //TODO: Fix this in backend
  const [_, relativePath] = shapefileUrl.split('/public/')
  return await window
    .fetch(relativePath)
    .then(response => response.arrayBuffer())
    .then(shp)
    .catch(alert);
}

export default getGeoJSON;
