import "src/decidim/map/controller/markers"
import "src/decidim/map/icon"

const { initMap, createScopesMenu, createGeoDatasourceLayer } = require("./ui");
const { CONFIG } = require("./constants");

async function main() {   
  let map = undefined;
  try {
    map = await initMap(CONFIG);

    // inserts the shapes from scopes associated with shapedata
    // as layers
    const scopesMenu = await createScopesMenu(map, CONFIG);

    // inserts the resources with lat and log like,
    // meetings, proposals, processes and assemblies as circleMarkers
    const geoDatasourceLayer = await createGeoDatasourceLayer({
      mapConfig: CONFIG,
      map
    });
    if (geoDatasourceLayer) { geoDatasourceLayer.addTo(map) }

  } catch(e) {
    console.error(e);
    // If there is anything that happens, 
    // we don't want to see the map.
    if(map?.remove){
      map.off()
      map.remove();
    }
    document.getElementById(CONFIG.mapID)?.remove();
  }
  
}

main();
