const { initMap, createScopesDropdown } = require("./ui");
const { getGeoShapefiles, getGeoJSON } = require("./api");
const polylabel = require("polylabel");

async function main() {
  const map = await initMap();

  const scopesDropdown = await createScopesDropdown(map);
}

main();
