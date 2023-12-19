import { createStore } from "zustand/vanilla";
import _ from "lodash";
import { subscribeWithSelector } from "zustand/middleware";
import pointStore from "./pointStore";
import dropdownFilterStore from "./dropdownFilterStore";

const sortingIteratee = (filter) => JSON.stringify(filter);
const store = createStore(
  subscribeWithSelector((set) => ({
    defaultFilters: [],
    activeFilters: [],
    setDefaultFilters: (filters = []) => {
      const sortedFilters = _.sortBy(filters, [sortingIteratee]);
      set(() => ({
        defaultFilters: sortedFilters,
        activeFilters: sortedFilters
      }));
    },
    isFilteredByScope: () => {
      const { activeFilters } = store.getState();
      return !!activeFilters.find(({ scopeFilter }) => scopeFilter);
    },
    isFilteredByTime: () => {
      const { activeFilters } = store.getState();
      return !!activeFilters.find(({ timeFilter }) => timeFilter);
    },
    hasUserFilters: () => {
      const { defaultFilters, activeFilters } = store.getState();
      return _.isEqual(defaultFilters, activeFilters);
    },
    setFilters: (filters = []) => {
      const activeFilters = _.uniqBy(_.sortBy(filters, [sortingIteratee]), (filter) => {
        return Object.keys(filter).join("");
      });
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
    toFilterOptions: (name, filters) => {
      const { defaultFilters } = dropdownFilterStore.getState();
      switch (name) {
        case "GeoShowFilter":
          const showFilterMatch = filters.find(
            ({ geoencodedFilter = undefined }) => geoencodedFilter
          );
          if (!showFilterMatch) return defaultFilters.GeoShowFilter || "all";
          const geoencodedFilter = showFilterMatch.geoencodedFilter.geoencoded;
          if (geoencodedFilter === true) return "only_geoencoded";
          if (geoencodedFilter === false) return "only_virtual";
          return "all";
        case "GeoTimeFilter":
          const timeFilterMatch = filters.find(
            ({ timeFilter = undefined }) => timeFilter
          );
          if (!timeFilterMatch) return defaultFilters.GeoTimeFilter || "all";
          const timeFilter = timeFilterMatch.timeFilter.time;
          if (timeFilter === "past") return "only_past";
          if (timeFilter === "active") return "only_active";
          if (timeFilter === "future") return "only_future";
          return "all";
        case "GeoType":
          const typeFilterMatch = filters.find(
            ({ resourceTypeFilter = undefined }) => resourceTypeFilter
          );
          if (!typeFilterMatch) return defaultFilters.GeoType || "all";
          const resourceType = typeFilterMatch.resourceTypeFilter.resourceType;
          if (resourceType === "Decidim::Assembly") return "only_assemblies";
          if (resourceType === "Decidim::Proposals::Proposal") return "only_proposals";
          if (resourceType === "Decidim::Meetings::Meeting") return "only_meetings";
          if (resourceType === "Decidim::ParticipatoryProcess") return "only_processes";
          return defaultFilters.GeoType || "all";
      }
    }
  }))
);

// If you update the active filters, we need to fetch
// the point matching this filter.
store.subscribe(
  (state) => [state.activeFilters],
  async ([activeFilters], [previousActiveFilter]) => {
    if (!_.isEqual(activeFilters, previousActiveFilter))
      await pointStore.getState().pointsForFilters(activeFilters);
    const { toFilterOptions } = store.getState();
    const { setFilter } = dropdownFilterStore.getState();
    setFilter("GeoShowFilter", toFilterOptions("GeoShowFilter", activeFilters));
    setFilter("GeoTimeFilter", toFilterOptions("GeoTimeFilter", activeFilters));
    setFilter("GeoType", toFilterOptions("GeoType", activeFilters));
  }
);

export default store;
