import "src/decidim/map/controller/markers"
import "src/decidim/map/icon"

const { initMap, createScopesMenu, createGeoDatasourceLayer } = require("./ui");
const { CONFIG } = require("./constants");

async function main() {   
  let map = undefined;
  try{
    map = await initMap(CONFIG);
    const geoDatasourceLayer = await createGeoDatasourceLayer({
      mapConfig: CONFIG,
      map
    });
      const scopesMenu = await createScopesMenu(map, CONFIG);

      geoDatasourceLayer.addTo(map);
  }catch(e) {
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
