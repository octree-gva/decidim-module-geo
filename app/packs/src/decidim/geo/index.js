import "src/decidim/map/controller/markers";
import "src/decidim/map/icon";
import configStore from "./models/configStore";
import pointStore from "./models/pointStore";
import filterStore from "./models/filterStore";
import geoStore from "./models/geoStore";
import dropdownFilterStore from "./models/dropdownFilterStore";

import { initMap, createDrawerActions, createDrawer } from "./ui";
import bootstrap from "./bootstrap";

window.debug = window.debug || {};
window.debug.stores = () => ({
  config: configStore.getState(),
  filter: filterStore.getState(),
  geo: geoStore.getState(),
  point: pointStore.getState(),
  dropdownFilter: dropdownFilterStore.getState()
});

async function main() {
  try {
    // Parse and save server-side information.
    bootstrap();
    const { addProcess, removeProcess } = pointStore.getState();
    addProcess();
    // Create Leaflet map
    const map = await initMap();
    configStore.setState(() => ({ map: map }));

    // Be sure to fit all the points whenever you change
    // any filter.
    const pointsLayer = L.layerGroup();
    map.addLayer(pointsLayer);

    pointStore.subscribe(
      (state) => [!!state.isLoading, state.getFilteredPoints, state._lastResponse],
      ([isLoading, getFilteredPoints]) => {
        if (isLoading || !map) return;
        const { selectedPoint, selectedScope } = geoStore.getState();
        if (selectedPoint) return;
        pointsLayer.clearLayers();
        const { selected_component } = configStore.getState();
        let filter = (node) => true;
        if (!selectedPoint && !selectedScope && selected_component) {
          filter = (node) =>
            node.isGeoLocated() && `${node.data.componentId}` === `${selected_component}`;
        }
        const pointInMap = getFilteredPoints().filter((node) => node.isGeoLocated());
        if (pointInMap.length > 0) {
          pointInMap.forEach(({ marker }) => {
            pointsLayer.addLayer(marker);
          });
          const idealBoundingBox = pointInMap.filter(filter).map(({ marker }) => marker);
          const boundingBox = L.featureGroup(
            _.isEmpty(idealBoundingBox)
              ? pointInMap.map(({ marker }) => marker)
              : idealBoundingBox,
            { updateWhenZooming: true }
          );
          map.fitBounds(boundingBox.getBounds(), { padding: [64, 64] });
        } else {
          // maybe we are selecting only non-geolocated points
          // with still a zone.
          const { selectedScope } = geoStore.getState();
          if (selectedScope?.layer) {
            map.fitBounds(selectedScope.layer.getBounds(), { padding: [64, 64] });
          }
        }
      }
    );

    // Create the drawer menu
    await createDrawerActions();
    // Create the drawer
    await createDrawer();
    // Fetch all the data
    const { fetchAll, pointsForFilters, clearCache } = pointStore.getState();
    await fetchAll();
    clearCache();
    await pointsForFilters(filterStore.getState().defaultFilters);
    removeProcess();
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
