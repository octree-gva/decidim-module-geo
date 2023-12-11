import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import filterStore from "./filterStore";

const store = createStore(
  subscribeWithSelector((set) => ({
    locale: "en",
    selected_component: undefined,
    map: undefined,
    mapID: "Generic",
    map_config: {},
    i18n: {},
    setConfig: (mapConfig) => {
      set(() => ({
        locale: mapConfig.locale,
        selected_component: mapConfig.selected_component,
        mapID: mapConfig.mapID,
        map_config: mapConfig.map_config,
        i18n: mapConfig.i18n
      }));
      filterStore.getState().setDefaultFilters(mapConfig.filters);
    }
  }))
);

export default store;
