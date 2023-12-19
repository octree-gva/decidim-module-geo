import { createStore } from "zustand/vanilla";
import configStore from "./configStore";
import { getGeoDatasource, getGeoScopes } from "../api";
import GeoDatasourceNode from "./geoDatasourceNode";
import GeoScope from "./geoScope";
import { subscribeWithSelector } from "zustand/middleware";

const store = createStore(
  subscribeWithSelector((set) => ({
    /**
     * Data Points
     */
    points: [],
    scopes: [],
    isLoading: 0,
    _lastFilter: "",
    _lastResponse: [],
    clearCache: () => {
      set(() => ({ _lastFilter: "", _lastResponse: [] }));
    },
    addProcess: () => {
      set(({isLoading}) => ({isLoading: isLoading + 1}))
    },
    removeProcess: () => {
      set(({isLoading}) => ({isLoading: isLoading - 1}))
    },
    getFilteredPoints: () => store.getState()._lastResponse,
    fetchAll: async () => {
      const locale = configStore.getState().locale;
      set(({isLoading}) => ({ isLoading: isLoading+1 }));
      const data = await getGeoDatasource(
        {
          variables: { filters: [], locale: locale }
        },
        true
      );
      const points = data.nodes
        .map((node) => {
          const point = new GeoDatasourceNode({
            node
          });
          if (point.init()) {
            return point;
          }
          return undefined;
        })
        .filter(Boolean);

      set(() => ({
        points: points,
      }));
      const scopes = await getGeoScopes({
        variables: { locale: locale }
      });
      const geoScopes = scopes
        .map((scope) => {
          const geoScope = new GeoScope({
            geoScope: scope
          });
          geoScope.init();
          return geoScope.isEmpty() ? undefined : geoScope;
        })
        .filter(Boolean);
      set(() => ({
        scopes: geoScopes,
      }));
      set(({isLoading}) => ({
        isLoading: isLoading-1
      }));
    },
    pointsForFilters: async (filters = []) => {
      const locale = configStore.getState().locale;
      const {
        points,
        _lastFilter: lastFilter,
        _lastResponse: lastResponse
      } = store.getState();
      const cacheKey = JSON.stringify(filters);
      // cache
      if (cacheKey === lastFilter) {
        console.log("CACHE HIT: ", { lastFilter, lastResponse });
        return lastResponse;
      }

      set(({isLoading}) => ({ isLoading: isLoading+1 }));
      const ids = await getGeoDatasource(
        {
          variables: { filters, locale: locale }
        },
        false
      );
      if (!ids?.nodes) {
        return [];
      }
      const filteredPoints = ids.nodes
        .map(({ id: needleId, type: needleType }) => {
          return points.find(({ id }) => `${needleType}::${needleId}` === id);
        })
        .filter(Boolean);

      set(({isLoading}) => ({
        _lastFilter: cacheKey,
        _lastResponse: filteredPoints,
        isLoading: isLoading-1
      }));
      return filteredPoints;
    }
  }))
);

export default store;
