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
    _fetchedAll: false,
    _prefetched: [],
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
    loading() {
      const { isLoading, _fetchedAll } = store.getState();
      return isLoading > 0 || !_fetchedAll;
    },
    getFilteredPoints: () => store.getState()._lastResponse,
    fetchAll: async (filters = []) => {
      const { points: fetchedPoints } = store.getState();
      if (fetchedPoints.length > 0) return;

      const { locale, isIndex, defaultLocale } = configStore.getState();

      const promises = [];
      const filterWithoutTime = filters.filter(
        (f) => typeof f.timeFilter === "undefined"
      );
      promises.push(
        getGeoDataSource(
          {
            variables: { filters: filterWithoutTime, locale, defaultLocale, isIndex }
          },
          true
        ).then((data) => {
          const points = data.nodes.map(mapNodeToPoint).filter(Boolean);
          set(({ _prefetched }) => ({
            points: points,
            _lastResponse: _prefetched
              .map(({ id: needleId, type: needleType }) => {
                return points.find(({ id }) => `${needleType}::${needleId}` === id);
              })
              .filter(Boolean),
            _prefetched: [],
            _fetchedAll: true
          }));
          return { points };
        })
      );

      promises.push(
        getGeoScopes({
          variables: { locale: locale }
        }).then((scopes) => {
          return { geoScopes: scopes };
        })
      );
      await Promise.allSettled(promises).then((results) => {
        const rejected = results.filter((result) => result.status === "rejected");
        if (rejected.length > 0)
          console.error("ERR: fail to fetch." + rejected.map((r) => r.reason).join("."));
        const [fetchedGeoScopes] = results.filter(
          ({ value }) => typeof value.geoScopes !== "undefined"
        );
        const geoScopes = fetchedGeoScopes.value.geoScopes
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
        return { geoScopes };
      });
    },
    pointsForFilters: async (filters = [], forceRefresh = false) => {
      const { locale, isIndex } = configStore.getState();
      const {
        points,
        _fetchedAll,
        _lastFilter: lastFilter,
        _lastResponse: lastResponse
      } = store.getState();
      const cacheKey = JSON.stringify(filters);
      // cache
      if (cacheKey === lastFilter && !forceRefresh) {
        return lastResponse;
      }

      const ids = await getGeoDataSource(
        {
          variables: { filters, locale: locale, isIndex }
        },
        false
      );
      if (!ids?.nodes) {
        return [];
      }
      let filteredPoints = ids.nodes;
      if (_fetchedAll) {
        filteredPoints = filteredPoints.map(({ id: needleId, type: needleType }) => {
          return points.find(({ id }) => `${needleType}::${needleId}` === id);
        });
        set(() => ({
          _lastFilter: cacheKey,
          _lastResponse: filteredPoints.filter(Boolean)
        }));
        return;
      }

      set(() => ({
        _lastFilter: cacheKey,
        _prefetched: filteredPoints.filter(Boolean)
      }));
      return filteredPoints;
    }
  }))
);

export default store;
