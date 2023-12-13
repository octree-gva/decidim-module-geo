import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
const store = createStore(
  subscribeWithSelector((set) => ({
    isOpen: false,
    defaultFilters: {},
    selectedFilters: {},
    filterCount: () => {
      return Object.keys(store.getState().selectedFilters).length || 0;
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
