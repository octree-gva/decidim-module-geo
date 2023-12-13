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
    toFilterOptions: (name, filters) => {
      switch (name) {
        case "GeoShowFilter":
          return "all";
        case "GeoTimeFilter":
          return "all";
        case "GeoType":
          const typeMatch = filters.find(
            ({ resourceTypeFilter = undefined }) => resourceTypeFilter
          );
          if (!typeMatch) return "all";
          const resourceType = typeMatch.resourceTypeFilter.resourceType;
          if (resourceType === "Decidim::Assembly") return "only_assemblies";
          if (resourceType === "Decidim::Proposals::Proposal") return "only_proposals";
          if (resourceType === "Decidim::Meetings::Meeting") return "only_meetings";
          if (resourceType === "Decidim::ParticipatoryProcess") return "only_processes";
          return "all";
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
