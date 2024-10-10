import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";

const store = createStore(
  subscribeWithSelector((set, get) => ({
    isOpen: false,
    defaultFilters: {
      GeoScopeFilter: "all",
      GeoShowFilter: "all",
      GeoTimeFilter: "active",
      GeoType: "all"
    },
    selectedFilters: {
      GeoScopeFilter: "all",
      GeoShowFilter: "all",
      GeoTimeFilter: "active",
      GeoType: "all"
    },
    nextFilters: undefined,

    filterCount() {
      const { selectedFilters, defaultFilters } = store.getState();
      return Object.entries(selectedFilters).filter(([key, value]) => {
        return defaultFilters[key] !== value;
      }).length;
    },
    setNextFilter(name, value) {
      set((state) => ({
        nextFilters: {
          ...state.nextFilters,
          [`${name}`]: value || state.defaultFilters[`${name}`]
        }
      }));
    },
    applyNextFilters() {
      set(({ nextFilters }) => (nextFilters ? { selectedFilters: nextFilters } : {}));
    },
    resetFilters() {
      set(({ defaultFilters }) => ({
        selectedFilters: defaultFilters,
        nextFilters: defaultFilters
      }));
    },
    setDefaultFilters(newFilters) {
      set(() => ({ defaultFilters: newFilters, selectedFilters: newFilters }));
    },
    setFilter(name, value) {
      const prevState = get().selectedFilters;
      if (prevState[name] === value) return;
      set((state) => ({
        selectedFilters: {
          ...state.defaultFilters,
          ...state.selectedFilters,
          [`${name}`]: value || state.defaultFilters[`${name}`]
        }
      }));
    },
    toggleOpen() {
      set((state) => ({ isOpen: !state.isOpen }));
    },
    close() {
      set(() => ({ isOpen: false }));
    }
  }))
);

export default store;
