import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import filterStore from "./filterStore";
import dropdownFilterStore from "./dropdownFilterStore";
import memoryStore from "./memoryStore";
import configStore from "./configStore";
const store = createStore(
  subscribeWithSelector((set, get) => ({
    /**
     * Filters given by the backend
     */
    defaultFilters: [],
    /**
     * data point that is currently clicked
     */
    selectedPoint: undefined,
    /**
     *
     */
    selectedScope: null,
    previousState: null,

    hasNoScopeSelected: () => {
      return !get().selectedScope || get().selectedScope === null;
    },

    /**
     * Action when we click on a point.
     */
    selectPoint: (point) => {
      const { saveState } = memoryStore.getState();
      saveState();
      set((state) => ({
        ...state,
        selectedPoint: point,
        previousState: state
      }));
    },
    /**
     * Action when a scope is selected.
     * - select the scope if any
     * -
     */
    selectScope: (scope) => {
      const { saveState } = memoryStore.getState();

      saveState();
      dropdownFilterStore.setState(({ nextFilters, selectedFilters }) => ({
        nextFilters: { ...nextFilters, GeoScopeFilter: `${scope?.id || "all"}` },
        selectedFilters: { ...selectedFilters, GeoScopeFilter: `${scope?.id || "all"}` }
      }));
      set((state) => ({
        selectedScope: scope || null,
        ...(`${scope?.id}` !== `${state.selectedScope?.id}`
          ? { previousState: state }
          : null),
        // unselect point when moving away from its scope
        selectedPoint:
          state.selectedPoint && state.selectedPoint.geoScopeId === scope?.id
            ? state.selectedPoint
            : null
      }));
      if (scope) scope.repaint();
    },
    /**
     * Go back to previous state
     */
    goBack: () => {
      set((state) => ({
        ...state.previousState
      }));
      const { popState } = memoryStore.getState();
      setTimeout(popState, 32);
    }
  }))
);

store.subscribe(
  (state) => [state.selectedScope],
  ([selectedScope]) => {
    // Close the drowp down
    dropdownFilterStore.getState().close();

    // Update filter associated to the scope
    const { activeFilters, setFilters, scopeFilter, defaultFilters } =
      filterStore.getState();
    const filtersWithoutScopes = activeFilters.filter(({ scopeFilter }) => {
      return !scopeFilter;
    });
    const currentScopeFilterId = scopeFilter(activeFilters);
    if (`${currentScopeFilterId}` === `${selectedScope?.id}`) return;
    if (selectedScope?.id) {
      const matchFilter = activeFilters.find(
        ({ scopeFilter }) => scopeFilter?.scopeId === selectedScope.id
      );
      if (!matchFilter)
        setFilters(
          filtersWithoutScopes.concat({ scopeFilter: { scopeId: selectedScope.id } })
        );
    } else {
      const defaultScopeFilter = defaultFilters.find(({ scopeFiler }) => scopeFilter);
      if (defaultScopeFilter) setFilters(filtersWithoutScopes.concat(defaultScopeFilter));
      else setFilters(filtersWithoutScopes);
    }
  }
);

store.subscribe(
  (state) => [state.selectedScope],
  ([selectedScope], [previousScope]) => {
    // Close the filter dropdown
    if (previousScope) previousScope.repaint();
    if (selectedScope) {
      selectedScope.repaint();
    }
    dropdownFilterStore.getState().close();
  }
);

store.subscribe(
  (state) => [state.selectedPoint],
  async ([selectedPoint], [previousPoint]) => {
    if (!selectedPoint) {
      return;
    }
    // Close the filter dropdown
    dropdownFilterStore.getState().close();
    // Open drawer
    configStore.getState().openAside();
    // Center to the marker
    selectedPoint.repaint();
    await selectedPoint.panToMarker();

    if (previousPoint) previousPoint.repaint();
  }
);
export default store;
