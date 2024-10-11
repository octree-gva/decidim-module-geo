import { createStore } from "zustand/vanilla";
import _ from "lodash";
import { subscribeWithSelector } from "zustand/middleware";
import pointStore from "./pointStore";
import geoStore from "./geoStore";
import dropdownFilterStore from "../stores/dropdownFilterStore";
import pointCounterStore from "../stores/pointCounterStore";
const sortingIteratee = (filter) => JSON.stringify(filter);
const store = createStore(
  subscribeWithSelector((set, get) => ({
    defaultFilters: [],
    activeFilters: [],
    setDefaultFilters: (filters = []) => {
      const sortedFilters = _.sortBy(filters, [sortingIteratee]);
      set(() => ({
        defaultFilters: sortedFilters
      }));
    },
    isFilteredByScope: (filters = undefined) => {
      const { scopeFilter } = store.getState();
      return !!scopeFilter(filters);
    },
    scopeFilter: (filters = undefined) => {
      if (!filters) {
        const { activeFilters } = store.getState();
        filters = activeFilters;
      }
      return filters.find(({ scopeFilter }) => scopeFilter)?.scopeFilter?.scopeId;
    },
    isFilteredByTime: (filters = undefined) => {
      if (!filters) {
        const { activeFilters } = store.getState();
        filters = activeFilters;
      }
      return !!filters.find(({ timeFilter }) => timeFilter);
    },
    hasUserFilters: () => {
      const { defaultFilters, activeFilters } = store.getState();
      return _.isEqual(defaultFilters, activeFilters);
    },
    setFilters: (filters = []) => {
      const activeFilters = _.sortBy(filters, [sortingIteratee]);
      set((state) => {
        if (_.isEqual(state.activeFilters, activeFilters)) return {};
        return { activeFilters };
      });
    },
    resetFilters: () => {
      set((state) => ({
        activeFilters: state.defaultFilters
      }));
    },
    /**
     * Check if the map to displays is only for processes
     * @returns bool if serverside required  a participatory process type map only
     */
    isProcessOnly() {
      const { defaultFilters } = get();
      const resourceFilter = defaultFilters.find(
        ({ resourceTypeFilter = undefined }) => resourceTypeFilter
      );
      if (!resourceFilter) return false;
      const { resourceType } = resourceFilter.resourceTypeFilter;
      return resourceType === "participatory_processes";
    },
    /**
     *
     * @returns bool if serverside require a assembly type map only
     */
    isAssemblyOnly() {
      const { defaultFilters } = get();
      const resourceFilter = defaultFilters.find(
        ({ resourceTypeFilter = undefined }) => resourceTypeFilter
      );
      if (!resourceFilter) return false;
      const { resourceType } = resourceFilter.resourceTypeFilter;
      return resourceType === "assemblies";
    },
    toFilterOptions: (name, filters) => {
      const { defaultFilters } = dropdownFilterStore.getState();
      switch (name) {
        case "GeoShowFilter":
          const showFilterMatch = filters.find(
            ({ geoencodedFilter = undefined }) => geoencodedFilter
          );
          if (!showFilterMatch) return defaultFilters.GeoShowFilter;
          const geoencodedFilter = showFilterMatch.geoencodedFilter.geoencoded;
          if (geoencodedFilter === true) return "geoencoded";
          if (geoencodedFilter === false) return "virtual";
          return defaultFilters.GeoShowFilter;
        case "GeoScopeFilter":
          const filterGeoScope = filters.find(
            ({ scopeFilter = undefined }) => scopeFilter
          );
          if (!filterGeoScope) {
            return defaultFilters.GeoScopeFilter;
          }
          return `${filterGeoScope.scopeFilter.scopeId}`;
        case "GeoTimeFilter":
          const timeFilterMatch = filters.find(
            ({ timeFilter = undefined }) => timeFilter
          );

          if (!timeFilterMatch) return defaultFilters.GeoTimeFilter;
          const timeFilter = timeFilterMatch.timeFilter.time;
          if (timeFilter) return timeFilter;
          return defaultFilters.GeoTimeFilter;
        case "GeoType":
          const typeFilterMatch = filters.find(
            ({ resourceTypeFilter = undefined }) => resourceTypeFilter
          );
          if (!typeFilterMatch) return defaultFilters.GeoType;
          const resourceType = typeFilterMatch.resourceTypeFilter.resourceType;
          if (resourceType) return `${resourceType}`;
          return defaultFilters.GeoType;
      }
    }
  }))
);

const onFilteredByScope = (filters) => {
  const { scopeFilter } = store.getState();
  const { scopeForId } = pointStore.getState();
  let scopeId;
  const { selectedScope: previousScope } = geoStore.getState();
  const { selectScope } = geoStore.getState();
  if ((scopeId = scopeFilter(filters))) {
    if (previousScope && `${scopeId}` === `${previousScope?.id}`) return;
    const selectedScope = scopeForId(scopeId);
    if (selectedScope) selectScope(selectedScope);
  } else {
    if (previousScope) {
      previousScope.repaint();
    }
    selectScope(null);
  }
};

// If you update the active filters, we need to fetch
// the point matching this filter.
store.subscribe(
  (state) => [state.activeFilters],
  async ([activeFilters], [previousActiveFilter]) => {
    if (activeFilters && _.isEqual(activeFilters, previousActiveFilter)) return;

    // Select/Unselect scopes if a scopeFilter is present
    if (activeFilters) {
      await pointStore.getState().pointsForFilters(activeFilters);
      onFilteredByScope(activeFilters);
    }

    // Update the filter modal state
    const { toFilterOptions } = store.getState();
    const { setFilter } = dropdownFilterStore.getState();
    setFilter("GeoScopeFilter", toFilterOptions("GeoScopeFilter", activeFilters));
    setFilter("GeoShowFilter", toFilterOptions("GeoShowFilter", activeFilters));
    setFilter("GeoTimeFilter", toFilterOptions("GeoTimeFilter", activeFilters));
    setFilter("GeoType", toFilterOptions("GeoType", activeFilters));

    // Update active counters.
    const { updateCurrentCountForFilters } = pointCounterStore.getState();
    await updateCurrentCountForFilters(activeFilters);
  }
);

export default store;
