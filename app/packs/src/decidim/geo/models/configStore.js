import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import geoStore from "./geoStore";
import filterStore from "./filterStore";
import dropdownFilterStore from "./dropdownFilterStore";

const store = createStore(
  subscribeWithSelector((set) => ({
    locale: "en",
    selected_component: undefined,
    selected_point: undefined,
    space_id: undefined,
    images: {},
    map: undefined,
    mapReady: false,
    mapID: "Generic",
    map_config: {},
    i18n: {},
    setReady: () => set({ mapReady: true }),
    setConfig: (mapConfig) => {
      set(() => ({
        locale: mapConfig.locale,
        selected_component: mapConfig.selected_component,
        space_id: mapConfig.space_id,
        selected_point: mapConfig.selected_point,
        mapID: mapConfig.mapID,
        map_config: mapConfig.map_config,
        i18n: mapConfig.i18n,
        images: mapConfig.images || {}
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
