import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
const store = createStore(
  subscribeWithSelector((set) => ({
    isOpen: false,
    defaultFilters: {GeoShowFilter: "all",
      GeoTimeFilter: "all",
      GeoType: "only_active"},
    selectedFilters: {GeoShowFilter: "all",
    GeoTimeFilter: "all",
    GeoType: "only_active"},
    filterCount: () => {
      const {selectedFilters, defaultFilters} = store.getState()
      return Object.entries(selectedFilters).filter(([key, value]) => {
        return defaultFilters[key] !== value
      }).length
    },
    resetFilters: () => {
      set(({ defaultFilters }) => ({ selectedFilters: defaultFilters }));
    },
    setFilter: (name, value) => {
      set((state) => ({
        selectedFilters: {
          ...state.selectedFilters,
          [`${name}`]: value || "all"
        }
      }));
    },
    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    close: () => set(() => ({ isOpen: false }))
  }))
);

export default store;
