import "src/decidim/map/controller/markers";
import "src/decidim/map/icon";
import configStore from "./models/configStore";
import pointStore from "./models/pointStore";
import filterStore from "./models/filterStore";
import geoStore from "./models/geoStore";

import { initMap, createDrawerActions, createDrawer } from "./ui";
import bootstrap from "./bootstrap";

window.debug = window.debug || {};
window.debug.stores = () => ({
  config: configStore.getState(),
  filter: filterStore.getState(),
  geo: geoStore.getState(),
  point: pointStore.getState()
});

async function main() {
  try {
    // Parse and save server-side information.
    bootstrap();

    // Create Leaflet map
    const map = await initMap();
    configStore.setState(() => ({ map: map }));

    // Be sure to fit all the points whenever you change
    // any filter.
    const pointsLayer = L.layerGroup();
    map.addLayer(pointsLayer);
    pointStore.subscribe(
      (state) => [state.isLoading, state.getFilteredPoints, state._lastResponse],
      ([isLoading, getFilteredPoints]) => {
        if (isLoading) return;
        pointsLayer.clearLayers();
        const group = L.featureGroup(
          getFilteredPoints().map(({ marker }) => {
            pointsLayer.addLayer(marker);
            return marker;
          })
        );
        map.fitBounds(group.getBounds());
      }
    );

    // Create the drawer menu
    await createDrawerActions();
    // Create the drawer
    await createDrawer();
    // Fetch all the data
    await pointStore.getState().fetchAll();
  } catch (e) {
    console.error(e);
    const { map, mapID } = configStore.getState();

    // If there is anything that happens,
    // we don't want to see the map.
    if (map?.remove) {
      map.remove();
    }
    if (map?.off) {
      map.off();
    }
    document.getElementById(mapID)?.remove();
  }
}

main();
