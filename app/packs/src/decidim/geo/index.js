import "src/decidim/map/controller/markers"
import "src/decidim/map/icon"

const { initMap, createScopesMenu, createGeoDatasourceLayer } = require("./ui");
const { CONFIG } = require("./constants");

async function main() {
  const map = await initMap(CONFIG);

  if (CONFIG.id === "HomePage") {
    const scopesMenu = await createScopesMenu(map);
  } else {
    const geoDatasourceLayer = await createGeoDatasourceLayer({
      filters: CONFIG.filters,
    });
    geoDatasourceLayer.addTo(map);
  }
}

main();
