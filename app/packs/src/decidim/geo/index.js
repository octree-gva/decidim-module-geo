import "src/decidim/map/controller/markers";
import "src/decidim/map/icon";

import configStore from "./models/configStore";
import pointStore from "./models/pointStore";
import filterStore from "./models/filterStore";
import geoStore from "./models/geoStore";
import memoryStore from "./models/memoryStore";
import dropdownFilterStore from "./models/dropdownFilterStore";
import { initMap, createDrawerActions, createDrawer, createSlideEdge } from "./ui";
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

async function displayMap(isFullscreen = false) {
  try {
    // Parse and save server-side information.
    bootstrap();
    configStore.getState().setFullscreen(isFullscreen);

    const { addProcess, removeProcess } = pointStore.getState();
    const { moveHandler, setSavedPosition } = memoryStore.getState();
    addProcess();
    // Create Leaflet map
    const {map, tile} = await initMap();
    configStore.setState(() => ({ map, tile }));

    // Be sure to fit all the points whenever you change
    // any filter.
    const pointsLayer = L.layerGroup();
    map.addLayer(pointsLayer);
    map.whenReady(async () => {
      // Save the first loaded position.
      await new Promise((resolve) => setTimeout(resolve, 120));
      setSavedPosition();
      configStore.getState().setReady();
    });

    pointStore.subscribe(
      (state) => [!!state.isLoading, state.getFilteredPoints, state._lastResponse],
      ([isLoading, getFilteredPoints]) => {
        if (isLoading) return;
        const { space_ids: spaceIds, map } = configStore.getState();
        const { selectedPoint, selectedScope } = geoStore.getState();
        const { savedCenter } = memoryStore.getState();
        pointsLayer.clearLayers();
        let boudingBoxFilter = () => true;
        if (!selectedPoint && !selectedScope && spaceIds) {
          boudingBoxFilter = (node) =>
            node.isGeoLocated() && spaceIds.includes(`${node.scopeId}`);
        }
        if (selectedScope?.layer && selectedScope && !selectedPoint) {
          map.fitBounds(selectedScope.layer.getBounds(), { padding: [64, 64] });
        }

        const pointInMap = getFilteredPoints().filter((node) => node.isGeoLocated());
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
          if (!savedCenter && boundingBox && !selectedScope && !selectedPoint) {
            map.fitBounds(boundingBox.getBounds(), { padding: [64, 64] });
          }
        }
      }
    );
    createSlideEdge([createDrawer, createDrawerActions]);

    // Fetch all the data
    const { fetchAll, pointsForFilters, clearCache } = pointStore.getState();
    await fetchAll(filterStore.getState().defaultFilters);
    clearCache();
    await pointsForFilters(filterStore.getState().defaultFilters);
    removeProcess();
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

function main() {
  var smallScreen = window.matchMedia("(max-width: 49.9988em)");
  if (smallScreen.matches) {
    registerMobile();
    document
      .querySelector(".js-decidimgeo.map-link")
      .addEventListener("click", function () {
        const { mapReady, setFullscreen } = configStore.getState();
        if (mapReady) {
          setFullscreen(true);
        } else {
          displayMap(true);
        }
      });
  } else {
    displayMap();
  }
}

window.addEventListener("load", function () {
  main();
});
