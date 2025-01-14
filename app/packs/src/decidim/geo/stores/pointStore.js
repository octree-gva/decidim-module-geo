import { createStore } from "zustand/vanilla";
import configStore from "./configStore";

import { getGeoDataSource, getGeoScopes } from "../api";
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

const filteredIdsStore = createStore((set, get) => ({
  activeFilterIds: []
}));
let fetchAllCalled = false;

const store = createStore(
  subscribeWithSelector((set, get) => ({
    /**
     * Data Points
     */
    points: [],
    scopes: [],
    fetchedGeoScopes: [],
    selectedGeoScopeIds: [],
    isInitialized: false,
    isLoading: 0,
    _lastFilter: "",
    _lastResponse: [],
    lastResponseCount: 0,
    fetchesRunning: 0,
    scopeForId: (scopeId) => {
      const scope = get().scopes.find(({ data }) => `${data.id}` === `${scopeId}`);
      if (!scope || scope.isEmpty()) return null;
      return scope;
    },
    clearCache: () => {
      set(() => ({ _lastFilter: "", _lastResponse: [], lastResponseCount: 0 }));
    },
    addProcess: () => {
      set(({ isLoading }) => ({ isLoading: isLoading + 1 }));
    },
    removeProcess: () => {
      set(({ isLoading }) => ({ isLoading: isLoading - 1 }));
    },
    loading() {
      const { isLoading, fetchesRunning } = store.getState();
      return isLoading > 0 || !fetchAllCalled || fetchesRunning;
    },
    getFilteredPoints: () => store.getState()._lastResponse,
    _updateCache: () => {
      const filteredPoints = filteredIdsStore.getState().activeFilterIds;
      const { scopeLayer } = configStore.getState();
      const { selectedGeoScopeIds, fetchedGeoScopes, points, scopes } = get();
      scopes.forEach((scope) => scope.remove());
      scopeLayer.clearLayers();
      let geoScopes = [];

      if (fetchedGeoScopes.length > 0 && selectedGeoScopeIds.length > 0) {
        geoScopes = selectedGeoScopeIds
          .map((scopeId) => {
            const match = fetchedGeoScopes.find(({ id }) => `${id}` === `${scopeId}`);
            if (!match) return null;
            const geoScope = new GeoScope({
              geoScope: match
            });
            geoScope.init(scopeLayer);
            return geoScope;
          })
          .filter(Boolean);
      }
      const responsePoints = filteredPoints
        .map(({ id: needleId }) => {
          return points.find(({ id }) => `${needleId}` === `${id}`);
        })
        .filter(Boolean);
      set(() => ({
        _lastResponse: responsePoints,
        lastResponseCount: responsePoints.length,
        scopes: geoScopes
      }));
      scopeLayer.eachLayer(function (layer) {
        layer.bringToBack();
      });
    },
    fetchAll: async (filters = []) => {
      const { points: fetchedPoints } = store.getState();
      if (fetchedPoints.length > 0) return;

      const { locale, isIndex, isGroup } = configStore.getState();

      const promises = [];
      const filterWithoutTime = filters.filter(
        (f) => typeof f.timeFilter === "undefined"
      );
      set(({ fetchesRunning }) => ({ fetchesRunning: fetchesRunning + 1 }));
      await getGeoDataSource(
        { filters: filterWithoutTime, locale, isIndex, isGroup },
        true,
        (data, hasMore, meta) => {
          const points = data.map(mapNodeToPoint).filter(Boolean);
          store.setState(({ points: prevPoints }) => ({
            points: [...prevPoints, ...points]
          }));
          fetchAllCalled = !hasMore;
          get()._updateCache();
          set(({ fetchesRunning }) => ({
            fetchesRunning: fetchesRunning - (hasMore ? 0 : 1),
            selectedGeoScopeIds: meta.geo_scope_ids || []
          }));
        }
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
        const [fetchedGeoScopes] = results
          .filter(({ value }) => typeof value.geoScopes !== "undefined")
          .map(({ value: { geoScopes } }) => geoScopes);
        set(() => ({ fetchedGeoScopes }));
        get()._updateCache();
      });
    },

    pointsForFilters: async (filters = [], forceRefresh = false) => {
      const { locale, isIndex, isGroup } = configStore.getState();
      const { _lastFilter: lastFilter, _lastResponse: lastResponse } = store.getState();
      const cacheKey = JSON.stringify(filters);
      // cache
      if (cacheKey === lastFilter && !forceRefresh) {
        return lastResponse;
      }
      set(({ fetchesRunning }) => ({
        fetchesRunning: fetchesRunning + 1,
        _lastFilter: cacheKey
      }));
      filteredIdsStore.setState(() => ({ activeFilterIds: [] }));

      await getGeoDataSource(
        { filters, locale: locale, isIndex, isGroup },
        false,
        (data, hasMore) => {
          filteredIdsStore.setState(({ activeFilterIds }) => ({
            activeFilterIds: activeFilterIds.concat(data || [])
          }));
          set(({ fetchesRunning }) => ({
            fetchesRunning: fetchesRunning - (hasMore ? 0 : 1)
          }));
          get()._updateCache();
        }
      );
    }
  }))
);

export default store;
