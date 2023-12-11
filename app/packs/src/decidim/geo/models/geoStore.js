import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import dataPointStore from "./pointStore";
import filterStore from "./filterStore";

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
        selectedScope: dataPointStore
          .getState()
          .scopes.find(({ data }) => data.id === point.scopeId),
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
      set((state) =>
        state.selectedScope === scope
          ? {}
          : {
              selectedScope: scope,
              previousState: state,
              // unselect point when moving away from its scope
              selectedPoint:
                state.selectedPoint && state.selectedPoint.scopeId === scope?.id
                  ? state.selectedPoint
                  : undefined
            }
      );
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
/**
 * When we select a scope, we define a use filter.
 */
store.subscribe(
  (state) => [state.selectedScope],
  ([selectedScope]) => {
    const { activeFilters, setFilters } = filterStore.getState();
    const filtersWithoutScopes = activeFilters.filter((filter) => {
      return typeof filter["scopeFilter"] === "undefined";
    });
    if (selectedScope?.id) {
      setFilters(
        filtersWithoutScopes.concat({ scopeFilter: { scopeId: selectedScope.id } })
      );
    } else {
      setFilters(filtersWithoutScopes);
    }
  }
);
export default store;
