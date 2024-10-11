import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import filterStore from "./filterStore";
import dropdownFilterStore from "./dropdownFilterStore";

const store = createStore(
  subscribeWithSelector((set, get) => ({
    locale: "en",
    defaultLocale: "en",
    selected_component: undefined,
    defaultSelectedPoint: undefined,
    space_ids: [],
    images: {},
    tile: undefined,
    pageName: "",
    map: undefined,
    mapReady: false,
    pointsLayer: L.layerGroup(),
    scopeLayer: L.layerGroup(),
    isIndex: false,
    mapID: "Generic",
    map_config: {},
    i18n: {},
    isAsideOpen: false,
    isFullscreen: false,
    isSmallScreen: false,
    activeManifests: [],
    closeAside: async () => {
      const wasClosed = !get().isAsideOpen
      if(wasClosed) return;

      set(() => ({ isAsideOpen: false }))
      return new Promise((resolve) => setTimeout(resolve, 520))
    },
    openAside: async () => {
      const wasOpen = get().isAsideOpen
      if(wasOpen) return;
      set(() => ({ isAsideOpen: true }))
      return  new Promise((resolve) => setTimeout(resolve, 520))
    },
    setFullscreen: (fullscreen) => set({ isFullscreen: !!fullscreen }),
    setReady: () => set({ mapReady: true }),
    setConfig: (mapConfig) => {
      const findPageName = () => {
        const [titleTag] = document.getElementsByTagName("title");
        const [titleContent] = (titleTag.textContent || "").split(" - ")
        return titleContent || "Home";
      }
      set(() => ({
        locale: mapConfig.locale,
        defaultLocale: mapConfig.default_locale,
        pageName: findPageName(),
        selected_component: mapConfig.selected_component,
        space_ids: mapConfig.space_ids,
        defaultSelectedPoint: mapConfig.selected_point,
        mapID: mapConfig.mapID,
        map_config: mapConfig.map_config,
        i18n: mapConfig.i18n,
        images: mapConfig.images || {},
        isIndex: mapConfig.is_index,
        activeManifests: mapConfig.active_manifests
      }));
      const { setDefaultFilters, setFilters, toFilterOptions } = filterStore.getState();
      setDefaultFilters(mapConfig.filters);
      setFilters(mapConfig.filters);

      dropdownFilterStore.getState().setDefaultFilters({
        GeoScopeFilter: toFilterOptions("GeoScopeFilter", mapConfig.filters),
        GeoShowFilter: toFilterOptions("GeoShowFilter", mapConfig.filters),
        GeoTimeFilter: toFilterOptions("GeoTimeFilter", mapConfig.filters),
        GeoType: toFilterOptions("GeoType", mapConfig.filters)
      });
    }
  }))
);
store.subscribe(
  ({ isAsideOpen }) => [isAsideOpen],
  ([isAsideOpen], [wasAsideOpen]) => {
    if (isAsideOpen && !wasAsideOpen) dropdownFilterStore.getState().close();
  }
);
export default store;
