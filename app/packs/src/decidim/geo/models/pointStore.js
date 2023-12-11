import { createStore } from "zustand/vanilla";
import configStore from "./configStore";
import { getGeoDatasource, getGeoScopes } from "../api";
import GeoDatasourceNode from "./GeoDatasourceNode";
import GeoScope from "./GeoScope";
import { subscribeWithSelector } from "zustand/middleware";

const store = createStore(
  subscribeWithSelector((set) => ({
    /**
     * Data Points
     */
    points: [],
    scopes: [],
    isLoading: true,
    _lastFilter: "",
    _lastResponse: [],
    getFilteredPoints: () => {
      const { _lastResponse, points } = store.getState();
      if (_lastResponse.length > 0) return _lastResponse;
      return points;
    },
    fetchAll: async () => {
      const locale = configStore.getState().locale;
      set(() => ({ isLoading: true }));
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
        _lastResponse: points,
        _lastFilter: ""
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
        isLoading: false,
        scopes: geoScopes
      }));
    },
    pointsForFilters: async (filters = []) => {
      const locale = configStore.getState().locale;
      const { points, _lastFilter, _lastResponse } = store.getState();
      // cache
      if (JSON.stringify(filters) === _lastFilter) {
        console.log("Cache Hit: same filter");
        return _lastResponse;
      }

      set(() => ({ isLoading: true }));
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
        .map(({ id: needleId }) => {
          return points.find(({ id }) => needleId === id);
        })
        .filter(Boolean);

      set(() => ({
        _lastFilter: JSON.stringify(filters),
        _lastResponse: filteredPoints,
        isLoading: false
      }));
      return filteredPoints;
    }
  }))
);

export default store;
