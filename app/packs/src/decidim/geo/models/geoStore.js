import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import dataPointStore from "./pointStore";
import filterStore from "./filterStore";
import dropdownFilterStore from "./dropdownFilterStore";

const store = createStore(
  subscribeWithSelector((set) => ({
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
    selectedScope: undefined,
    previousState: null,
    /**
     * Action when we click on a point.
     */
    selectPoint: (point) => {
      set((state) => ({
        ...state,
        selectedScope: dataPointStore.getState().scopeForId(point.scopeId),
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
      set((state) => ({
        selectedScope: scope,
        ...(`${scope?.id}` !== `${state.selectedScope?.id}`
          ? { previousState: state }
          : {}),
        // unselect point when moving away from its scope
        selectedPoint:
          state.selectedPoint && state.selectedPoint.scopeId === scope?.id
            ? state.selectedPoint
            : undefined
      }));
      scope.repaint();
    },
    /**
     * Go back to previous state
     */
    goBack: () => {
      set((state) => ({
        ...state.previousState
      }));
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
    dropdownFilterStore.getState().close();
    if (previousScope) previousScope.repaint();
    if (selectedScope) {
      selectedScope.repaint();
    }
  }
);

store.subscribe(
  (state) => [state.selectedPoint],
  async ([selectedPoint], [previousPoint]) => {
    if (!selectedPoint || selectedPoint === previousPoint) return;
    // Close the filter dropdown
    dropdownFilterStore.getState().close();
    // Center to the marker
    selectedPoint.repaint();
    await selectedPoint.panToMarker();
    if (previousPoint) previousPoint.repaint();
  }
);
export default store;
