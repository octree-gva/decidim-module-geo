import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import dropdownFilterStore from "./dropdownFilterStore";
const store = createStore(
  subscribeWithSelector((set) => ({
    isOpen: false,
    toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    close: () => set(() => ({ isOpen: false }))
  }))
);

store.subscribe(
  (state) => [state.isOpen],
  ([isOpen]) => {
    if (isOpen) {
      dropdownFilterStore.getState().close();
    }
  }
);
export default store;
