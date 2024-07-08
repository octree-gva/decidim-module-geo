import { createStore } from "zustand/vanilla";
import _ from "lodash";
import { subscribeWithSelector } from "zustand/middleware";
import pointStore from "./pointStore";
import geoStore from "./geoStore";
import dropdownFilterStore from "./dropdownFilterStore";

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
        return { activeFilters: activeFilters };
      });
    },
    resetFilters: () => {
      set((state) => ({
        activeFilters: state.defaultFilters
      }));
    },
    isProcessOnly() {
      const {defaultFilters} = get();
      const resourceFilter = defaultFilters.find(
        ({ resourceTypeFilter = undefined }) => resourceTypeFilter
      );
      if(!resourceFilter) return false;
      const {resourceType} = resourceFilter.resourceTypeFilter;
      return resourceType  === "Decidim::ParticipatoryProcess"
    },
    isAssemblyOnly() {
      const {defaultFilters} = get();
      const resourceFilter = defaultFilters.find(
        ({ resourceTypeFilter = undefined }) => resourceTypeFilter
      );
      if(!resourceFilter) return false;
      const {resourceType} = resourceFilter.resourceTypeFilter;
      return resourceType  === "Decidim::Assembly"
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
          if (geoencodedFilter === true) return "only_geoencoded";
          if (geoencodedFilter === false) return "only_virtual";
          return defaultFilters.GeoShowFilter;
        case "GeoTimeFilter":
          const timeFilterMatch = filters.find(
            ({ timeFilter = undefined }) => timeFilter
          );
          if (!timeFilterMatch) return defaultFilters.GeoTimeFilter;
          const timeFilter = timeFilterMatch.timeFilter.time;
          if (timeFilter === "past") return "only_past";
          if (timeFilter === "active") return "only_active";
          if (timeFilter === "future") return "only_future";
          return defaultFilters.GeoTimeFilter;
        case "GeoType":
          const typeFilterMatch = filters.find(
            ({ resourceTypeFilter = undefined }) => resourceTypeFilter
          );
          if (!typeFilterMatch) return defaultFilters.GeoType;
          const resourceType = typeFilterMatch.resourceTypeFilter.resourceType;
          if (resourceType === "Decidim::Assembly") return "only_assemblies";
          if (resourceType === "Decidim::Proposals::Proposal") return "only_proposals";
          if (resourceType === "Decidim::Meetings::Meeting") return "only_meetings";
          if (resourceType === "Decidim::Debates::Debate") return "only_debates";
          if (resourceType === "Decidim::ParticipatoryProcess") return "only_processes";
          if (resourceType === "all") return "all";
          return defaultFilters.GeoType;
      }
    }
  }))
);

const onFilteredByScope = (filters) => {
  const { scopeFilter } = store.getState();
  const { scopeForId } = pointStore.getState();
  let scopeId;
  if ((scopeId = scopeFilter(filters))) {
    const { selectScope, selectedScope: previousScope } = geoStore.getState();
    if (previousScope && `${scopeId}` === `${previousScope?.id}`) return;
    const selectedScope = scopeForId(scopeId);
    if (selectedScope) selectScope(selectedScope);
  }
};

// If you update the active filters, we need to fetch
// the point matching this filter.
store.subscribe(
  (state) => [state.activeFilters],
  async ([activeFilters], [previousActiveFilter]) => {
    if (!previousActiveFilter || !_.isEqual(activeFilters, previousActiveFilter)) {
      await pointStore.getState().pointsForFilters(activeFilters);
      onFilteredByScope(activeFilters);
    }
    const { toFilterOptions } = store.getState();
    const { setFilter } = dropdownFilterStore.getState();
    setFilter("GeoShowFilter", toFilterOptions("GeoShowFilter", activeFilters));
    setFilter("GeoTimeFilter", toFilterOptions("GeoTimeFilter", activeFilters));
    setFilter("GeoType", toFilterOptions("GeoType", activeFilters));
  }
);

export default store;
