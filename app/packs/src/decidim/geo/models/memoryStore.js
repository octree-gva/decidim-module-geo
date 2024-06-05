import { createStore } from "zustand/vanilla";
import configStore from "./configStore";
import { subscribeWithSelector } from "zustand/middleware";
import _ from "lodash";

const store = createStore(
  subscribeWithSelector((set, get) => ({
    savedCenter: null,
    savedZoom: null,
    currentCenter: null,
    currentZoom: null,
    setSavedPosition: () => {
      const { map, mapReady } = configStore.getState();
      if (!mapReady) return;
      set(() => ({ currentCenter: map.getCenter(), currentZoom: map.getZoom() }));
    },
    moveHandler: _.throttle(
      (e) => {
        const { map, mapReady } = configStore.getState();
        if (!mapReady) return;
        set(() => ({ currentCenter: map.getCenter(), currentZoom: map.getZoom() }));
      },
      320,
      { leading: true }
    ),
    saveState: () => {
      set(({ currentCenter, currentZoom }) => ({
        savedCenter: currentCenter,
        savedZoom: currentZoom
      }));
    },
    popState: () => {
      const { savedCenter, savedZoom } = get();
      const { map, mapReady } = configStore.getState();
      if (!savedCenter || !savedZoom || !mapReady) return null;
      map.setView(savedCenter, savedZoom, { animate: false });
    }
  }))
);

export default store;
