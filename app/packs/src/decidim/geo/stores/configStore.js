import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import filterStore from "./filterStore";
import dropdownFilterStore from "./dropdownFilterStore";

const store = createStore(
  subscribeWithSelector((set) => ({
    locale: "en",
    defaultLocale: "en",
    selected_component: undefined,
    selected_point: undefined,
    space_ids: [],
    images: {},
    tile: undefined,
    map: undefined,
    mapReady: false,
    isIndex: false,
    mapID: "Generic",
    map_config: {},
    i18n: {},
    isAsideOpen: false,
    isFullscreen: false,
    isSmallScreen: false,
    closeAside: () => set({ isAsideOpen: false }),
    setFullscreen: (fullscreen) => set({ isFullscreen: !!fullscreen }),
    setReady: () => set({ mapReady: true }),
    setConfig: (mapConfig) => {
      set(() => ({
        locale: mapConfig.locale,
        defaultLocale: mapConfig.default_locale,
        selected_component: mapConfig.selected_component,
        space_ids: mapConfig.space_ids,
        selected_point: mapConfig.selected_point,
        mapID: mapConfig.mapID,
        map_config: mapConfig.map_config,
        i18n: mapConfig.i18n,
        images: mapConfig.images || {},
        isIndex: mapConfig.is_index,
      }));
      const { setDefaultFilters, setFilters, toFilterOptions } = filterStore.getState();
      setDefaultFilters(mapConfig.filters);
      setFilters(mapConfig.filters);

      dropdownFilterStore.getState().setDefaultFilters({
        GeoShowFilter: toFilterOptions("GeoShowFilter", mapConfig.filters),
        GeoTimeFilter: toFilterOptions("GeoTimeFilter", mapConfig.filters),
        GeoType: toFilterOptions("GeoType", mapConfig.filters)
      });
    }
  }))
);

export default store;
