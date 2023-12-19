import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import scopeDropdownStore from "./scopeDropdownStore";
const store = createStore(
  subscribeWithSelector((set) => ({
    isOpen: false,
    defaultFilters: {
      GeoShowFilter: "all",
      GeoTimeFilter: "only_active",
      GeoType: "all"
    },
    selectedFilters: {
      GeoShowFilter: "all",
      GeoTimeFilter: "only_active",
      GeoType: "all"
    },
    filterCount: () => {
      const { selectedFilters, defaultFilters } = store.getState();
      return Object.entries(selectedFilters).filter(([key, value]) => {
        return defaultFilters[key] !== value;
      }).length;
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

store.subscribe(
  (state) => [state.isOpen],
  ([isOpen]) => {
    if (isOpen) {
      scopeDropdownStore.getState().close();
    }
  }
);
export default store;
