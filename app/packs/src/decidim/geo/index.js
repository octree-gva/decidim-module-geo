import "src/decidim/map/controller/markers";
import "src/decidim/map/icon";

import configStore from "./stores/configStore";
import pointStore from "./stores/pointStore";
import filterStore from "./stores/filterStore";
import geoStore from "./stores/geoStore";
import memoryStore from "./stores/memoryStore";
import dropdownFilterStore from "./stores/dropdownFilterStore";
import { initMap, ScopeDropdown, Drawer, aside } from "./ui";
import bootstrap from "./bootstrap";
import registerMobile from "./ui/mobile/registerMobile";

window.debug = window.debug || {};
window.debug.stores = () => ({
  config: configStore.getState(),
  filter: filterStore.getState(),
  geo: geoStore.getState(),
  point: pointStore.getState(),
  dropdownFilter: dropdownFilterStore.getState(),
  memoryStore: memoryStore.getState()
});

async function prepareLeaflet(isSmallScreen) {
  bootstrap();
  // Parse and save server-side information.
  const { map, tile } = await initMap();
  configStore.setState(() => ({ map, tile, isSmallScreen }));
}
async function fetchData() {
  const { addProcess, removeProcess, fetchAll } = pointStore.getState();
  addProcess();
  // Fetch all the data
  await fetchAll(filterStore.getState().defaultFilters)
  removeProcess();
}
async function displayMap() {
  try {
    const { addProcess, removeProcess } = pointStore.getState();
    const { moveHandler, setSavedPosition } = memoryStore.getState();
    const { map } = configStore.getState();
    addProcess();

    // Be sure to fit all the points whenever you change
    // any filter.
    const pointsLayer = L.layerGroup();
    map.addLayer(pointsLayer);
    map.whenReady(async () => {
      // Save the first loaded position.
      await new Promise((resolve) => setTimeout(resolve, 120));
      setSavedPosition();
      configStore.getState().setReady();
      removeProcess();
    });

    pointStore.subscribe(
      (state) => [!!state.isLoading, state.getFilteredPoints, state.fetchesRunning, state._lastResponse],
      ([isLoading, getFilteredPoints, fetchesRunning]) => {
        if (isLoading > 0) return;
        const { space_ids: spaceIds, map } = configStore.getState();
        const { selectedPoint, selectedScope } = geoStore.getState();
        const { savedCenter } = memoryStore.getState();
        pointsLayer.clearLayers();
        let boudingBoxFilter = () => true;
        if (!fetchesRunning && !selectedPoint && !selectedScope && spaceIds) {
          boudingBoxFilter = (node) =>
            node.isGeoLocated() && spaceIds.includes(`${node.scopeId}`);
        }
        if (!fetchesRunning && selectedScope?.layer && selectedScope && !selectedPoint) {
          map.fitBounds(selectedScope.layer.getBounds(), { padding: [64, 64] });
        }

        const pointInMap = getFilteredPoints().filter(
          (node) => typeof node.isGeoLocated !== "undefined" && node.isGeoLocated()
        );
        if (pointInMap.length > 0) {
          pointInMap.forEach(({ marker }) => {
            pointsLayer.addLayer(marker);
          });
          const idealBoundingBox = pointInMap
            .filter(boudingBoxFilter)
            .map(({ marker }) => marker);
          const boundingBox = L.featureGroup(
            _.isEmpty(idealBoundingBox)
              ? pointInMap.map(({ marker }) => marker)
              : idealBoundingBox,
            { updateWhenZooming: true }
          );
          if (!fetchesRunning && !savedCenter && boundingBox && !selectedScope && !selectedPoint) {
            map.fitBounds(boundingBox.getBounds(), { padding: [64, 64] });
          }
        }
      }
    );
    aside([ScopeDropdown, Drawer]);

    // Set active class on dropdown element
    geoStore.subscribe(
      (state) => [state.selectedScope],
      ([geoScope]) => {
        // Remove all active classes.
        const activeList = document.getElementsByClassName(
          "decidimGeo__scopesDropdown__listItem--active"
        );
        for (const domEl of activeList) {
          domEl.className = domEl.className
            .replace("decidimGeo__scopesDropdown__listItem--active", "")
            .trim();
        }
        const [container] = document.querySelectorAll(
          ".decidimGeo__scopesDropdown__list"
        );
        if (!container) return;
        if (geoScope?.id) {
          const [active] = document.querySelectorAll(
            `.decidimGeo__scopesDropdown__listItem[data-scope='${geoScope.id}']`
          );
          if (active) {
            active.className += " decidimGeo__scopesDropdown__listItem--active";
            container.scrollBy(active.getBoundingClientRect().left, 0);
          }
        } else {
          const [active] = document.querySelectorAll(
            `.decidimGeo__scopesDropdown__listItem[data-scope='all']`
          );
          if (active) {
            active.className += " decidimGeo__scopesDropdown__listItem--active";
            container.scrollBy(active.getBoundingClientRect().left, 0);
          }
        }
      }
    );
    const [active] = document.querySelectorAll(
      `.decidimGeo__scopesDropdown__listItem[data-scope='all']`
    );
    if (active) active.className += " decidimGeo__scopesDropdown__listItem--active";

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
  });
});
