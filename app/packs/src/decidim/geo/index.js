import "src/decidim/map/controller/markers";
import "src/decidim/map/icon";

import configStore from "./stores/configStore";
import pointStore from "./stores/pointStore";
import filterStore from "./stores/filterStore";
import pointCounterStore from "./stores/pointCounterStore";
import geoStore from "./stores/geoStore";
import memoryStore from "./stores/memoryStore";
import dropdownFilterStore from "./stores/dropdownFilterStore";
import { initMap, DrawerHeader, Drawer, aside } from "./ui";
import bootstrap from "./bootstrap";
import registerMobile from "./ui/mobile/registerMobile";
import FilterControl from "./ui/FilterControl";
import PageNameControl from "./ui/PageNameControl";
window.debug = window.debug || {};
window.debug.stores = () => ({
  config: configStore.getState(),
  filter: filterStore.getState(),
  geo: geoStore.getState(),
  point: pointStore.getState(),
  dropdownFilter: dropdownFilterStore.getState(),
  memoryStore: memoryStore.getState(),
  pointCounterStore: pointCounterStore.getState()
});

async function prepareLeaflet(isSmallScreen) {
  bootstrap();
  // Parse and save server-side information.
  const { map, tile } = await initMap();
  configStore.setState(() => ({ map, isSmallScreen }));
}
async function fetchData() {
  const { addProcess, removeProcess, fetchAll, pointsForFilters } = pointStore.getState();
  const { defaultFilters, activeFilters } = filterStore.getState();
  addProcess();
  // Fetch all the data
  await Promise.all([fetchAll(defaultFilters), pointsForFilters(activeFilters)]);

  removeProcess();
}

async function displayMap() {
  try {
    const { addProcess, removeProcess } = pointStore.getState();
    const { moveHandler, setSavedPosition } = memoryStore.getState();
    const { map, pointsLayer, scopeLayer } = configStore.getState();
    addProcess();

    // Be sure to fit all the points whenever you change
    // any filter.
    map.addLayer(scopeLayer);
    map.addLayer(pointsLayer);

    map.whenReady(async () => {
      pointCounterStore
        .getState()
        .updateCurrentCountForFilters(filterStore.getState().activeFilters);
      // Add the aside to the map
      aside([DrawerHeader, Drawer]);

      map.addControl(new FilterControl());
      map.addControl(new PageNameControl());
      map.setMinZoom((configStore.getState().map_config.zoom || 15) - 2);
      // Save the first loaded position.
      await new Promise((resolve) => setTimeout(resolve, 120));
      configStore.getState().setReady();
      removeProcess();
      setTimeout(setSavedPosition, 320);
    });

    pointStore.subscribe(
      (state) => [
        !!state.isLoading,
        state.getFilteredPoints,
        state.fetchesRunning,
        state._lastResponse
      ],
      ([isLoading, getFilteredPoints, fetchesRunning]) => {
        const { isInitialized } = pointStore.getState();
        if (isLoading > 0 || !isInitialized) {
          return;
        }

        const { map, pointsLayer } = configStore.getState();
        const { selectedPoint, selectedScope } = geoStore.getState();
        pointsLayer.clearLayers();
        if (
          fetchesRunning === 0 &&
          selectedScope?.layer &&
          selectedScope &&
          !selectedPoint
        ) {
          map.setView(selectedScope.layer.getBounds().getCenter(), map.getZoom(), {
            animation: true
          });
        }
        const pointInMap = getFilteredPoints().filter(
          (node) => typeof node.isGeoLocated !== "undefined" && node.isGeoLocated()
        );

        if (pointInMap.length > 0) {
          pointInMap.forEach(({ marker }) => {
            pointsLayer.addLayer(marker);
          });
        }
        if (
          pointInMap.length > 0 &&
          !fetchesRunning &&
          !selectedScope &&
          !selectedPoint
        ) {
          const boundingBox = L.featureGroup(
            pointInMap.map(({ marker }) => marker)
          ).getBounds();
          if (map.getBounds().contains(boundingBox)) {
            return;
          }
        }
      }
    );

    // Set active class on dropdown element
    geoStore.subscribe(
      (state) => [state.selectedScope],
      ([geoScope]) => {
        // Remove all active classes.
        const activeList = document.getElementsByClassName(
          "decidimGeo__drawerHeader__listItem--active"
        );
        for (const domEl of activeList) {
          domEl.className = domEl.className
            .replace("decidimGeo__drawerHeader__listItem--active", "")
            .trim();
        }
        const [container] = document.querySelectorAll(".decidimGeo__drawerHeader__list");
        if (!container) return;
        if (geoScope?.id) {
          const [active] = document.querySelectorAll(
            `.decidimGeo__drawerHeader__listItem[data-scope='${geoScope.id}']`
          );
          if (active) {
            active.className += " decidimGeo__drawerHeader__listItem--active";
            container.scrollBy(active.getBoundingClientRect().left, 0);
          }
        } else {
          const [active] = document.querySelectorAll(
            `.decidimGeo__drawerHeader__listItem[data-scope='all']`
          );
          if (active) {
            active.className += " decidimGeo__drawerHeader__listItem--active";
            container.scrollBy(active.getBoundingClientRect().left, 0);
          }
        }
      }
    );
    const [active] = document.querySelectorAll(
      `.decidimGeo__drawerHeader__listItem[data-scope='all']`
    );
    if (active) active.className += " decidimGeo__drawerHeader__listItem--active";

    map.on("moveend", moveHandler);
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

async function main() {
  var smallScreen = window.matchMedia("(max-width: 49.9988em)");
  const isSmallScreen = !!smallScreen.matches;
  if (isSmallScreen) {
    registerMobile();
  }
  await prepareLeaflet(isSmallScreen);
  await fetchData();

  await displayMap();
}

window.addEventListener("load", function () {
  main().then(() => {
    console.log("decidim geo ready");
    setTimeout(() => pointStore.setState(() => ({ isInitialized: true })), 640);
  });
});
