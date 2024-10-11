import { createStore } from "zustand/vanilla";
import configStore from "./configStore";

import { countGeoDataSource } from "../api";
import { subscribeWithSelector } from "zustand/middleware";
import _ from "lodash";

const store = createStore(
  subscribeWithSelector((set, get) => ({
    /**
     * Counter for the active filters. Will count how many
     * results we currently have.
     */
    count: 0,
    /**
     * Counter for the filters modal. Will count how many
     * results we will have.
     */
    nextCount: 0,
    isLoading: false,

    async fetchCount(filters) {
      const { locale, isIndex } = configStore.getState();
      set(() => ({ isLoading: true }));
      const count = await countGeoDataSource({ filters, locale: locale, isIndex });
      set(() => ({ isLoading: false }));
      return count;
    },
    async updateCurrentCountForFilters(filters = []) {
      const count = await get().fetchCount(filters);
      set(() => ({ count }));
      return count;
    },
    async updateNextCountForFilters(filters = []) {
      const nextCount = await get().fetchCount(filters);
      set(() => ({ nextCount }));
      return nextCount;
    }
  }))
);

export default store;
