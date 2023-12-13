import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import filterStore from "./filterStore";
import pointStore from "./pointStore";

const store = createStore(
  subscribeWithSelector((set) => ({
    locale: "en",
    selected_component: undefined,
    selected_point: undefined,
    images: {},
    map: undefined,
    mapID: "Generic",
    map_config: {},
    i18n: {},
    setConfig: (mapConfig) => {
      set(() => ({
        locale: mapConfig.locale,
        selected_component: mapConfig.selected_component,
        selected_point: mapConfig.selected_point,
        mapID: mapConfig.mapID,
        map_config: mapConfig.map_config,
        i18n: mapConfig.i18n,
        images: mapConfig.images || {}
      }));
      filterStore.getState().setDefaultFilters(mapConfig.filters);
    }
  }))
);

export default store;
