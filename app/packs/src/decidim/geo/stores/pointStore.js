import { createStore } from "zustand/vanilla";
import configStore from "./configStore";

import { getGeoDataSource, getGeoScopes, getFirstGeoDataSource } from "../api";
import GeoDatasourceNode from "../models/GeoDatasourceNode";
import GeoScope from "../models/GeoScope";
import { subscribeWithSelector } from "zustand/middleware";
import _ from "lodash";

const mapNodeToPoint = (node) => {
  const point = new GeoDatasourceNode({
    node
  });
  if (point.init()) {
    return point;
  }
  return undefined;
};
const store = createStore(
  subscribeWithSelector((set, get) => ({
    /**
     * Data Points
     */
    points: [],
    scopes: [],
    isLoading: 0,
    _lastFilter: "",
    _lastResponse: [],
    scopeForId: (scopeId) => {
      const scope = get().scopes.find(({ data }) => `${data.id}` === `${scopeId}`);
      if (!scope || scope.isEmpty()) return null;
      return scope;
    },
    clearCache: () => {
      set(() => ({ _lastFilter: "", _lastResponse: [] }));
    },
    addProcess: () => {
      set(({ isLoading }) => ({ isLoading: isLoading + 1 }));
    },
    removeProcess: () => {
      set(({ isLoading }) => ({ isLoading: isLoading - 1 }));
    },
    getFilteredPoints: () => store.getState()._lastResponse,
    fetchAll: async (filters = []) => {
      const { points: fetchedPoints } = store.getState();
      if (fetchedPoints.length > 0) return;

      const locale = configStore.getState().locale;
      const defaultLocale = configStore.getState().defaultLocale;
      set(({ isLoading }) => ({ isLoading: isLoading + 1 }));
      const filterWithoutTime = filters.filter(
        (f) => typeof f.timeFilter === "undefined"
      );
      const firstData = await getFirstGeoDataSource(
        {
          variables: { filters: filterWithoutTime, locale, defaultLocale }
        },
        true
      );
      set(() => ({ points: firstData.nodes.map(mapNodeToPoint).filter(Boolean) }));

      const scopes = await getGeoScopes({
        variables: { locale: locale }
      });
      const geoScopes = (scopes || [])
        .map((scope) => {
          const geoScope = new GeoScope({
            geoScope: scope
          });
          geoScope.init();
          return geoScope.isEmpty() ? undefined : geoScope;
        })
        .filter(Boolean);

      set(() => ({
        scopes: geoScopes
      }));

      // Fetch other data after initialization
      if (firstData.hasMore) {
        const data = await getGeoDataSource(
          {
            variables: {
              filters: filterWithoutTime,
              locale: locale,
              after: firstData.after
            }
          },
          true
        );
        const newPoints = data.nodes.map(mapNodeToPoint).filter(Boolean);
        set(({ points }) => ({ points: points.concat(newPoints) }));
      }
      set(({ isLoading }) => ({
        isLoading: isLoading - 1
      }));
    },
    pointsForFilters: async (filters = [], forceRefresh = false) => {
      const locale = configStore.getState().locale;
      const {
        points,
        _lastFilter: lastFilter,
        _lastResponse: lastResponse
      } = store.getState();
      const cacheKey = JSON.stringify(filters);
      // cache
      if (cacheKey === lastFilter && !forceRefresh) {
        return lastResponse;
      }

      set(({ isLoading }) => ({ isLoading: isLoading + 1 }));
      const ids = await getGeoDataSource(
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

      set(({ isLoading }) => ({
        _lastFilter: cacheKey,
        _lastResponse: filteredPoints,
        isLoading: isLoading - 1
      }));
      return filteredPoints;
    }
  }))
);

export default store;
