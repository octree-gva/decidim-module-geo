import { createGeoScopeMenuItem, createGeoScopeLayer } from "../../ui";
import geoStore from "../geoStore";
import pointStore from "../pointStore";
import configStore from "../configStore";
import scopeDropdownStore from "../scopeDropdownStore";
import polylabel from "polylabel";
import _ from "lodash";

export default class GeoScope {
  constructor({ geoScope }) {
    //Model
    this.data = geoScope;
    this.markers_group = [];
    this.menuItem = null;
  }

  get activeState() {
    return { fillColor: "#2952A370", color: "#2952A3" };
  }

  isEmpty() {
    const { points } = pointStore.getState();
    const currentScopeId = this.id;
    return !points.find(({ scopeId }) => `${scopeId}` === `${currentScopeId}`);
  }

  isLoading() {
    return pointStore.getState().isLoading;
  }

  get staledState() {
    return { fillColor: "#cccccc", color: "#999999" };
  }

  select() {
    const { selectedScope: previousScope } = geoStore.getState();
    if (previousScope === this) return;
    geoStore.getState().selectScope(this);
  }

  /**
   * If the current marker is selected (active)
   * @returns boolean
   */
  isActive() {
    const { selectedScope } = geoStore.getState();
    if (selectedScope) return selectedScope === this;
    return false;
  }

  repaint() {
    if (this.isActive()) {
      this.layer?.setStyle(this.activeState);
    } else {
      this.layer?.setStyle(this.staledState);
    }
  }

  get name() {
    return this.data.name.translation;
  }

  get id() {
    return parseInt(`${this.data.id}`);
  }

  nodesForScope() {
    const { points } = pointStore.getState();
    const currentScopeId = this.id;
    return points.filter(({ scopeId }) => scopeId === currentScopeId).filter(Boolean);
  }

  markersForScope() {
    if (this.markers_group.length > 0) return this.markers_group;
    return this.nodesForScope()
      .filter((node) => node.isGeoLocated())
      .map(({ marker }) => marker);
  }

  componentIds() {
    return _.uniq(
      this.nodesForScope()
        .map(({ data }) => (data.componentId ? `${data.componentId}` : false))
        .filter(Boolean)
    );
  }

  init() {
    const { map } = configStore.getState();
    this.markers_group = this.markersForScope();
    this.menuItem = createGeoScopeMenuItem({
      label: this.name,
      onClick: () => {
        scopeDropdownStore.getState().toggleOpen();
        geoStore.getState().selectScope(this);
        this.repaint();
      }
    });
    if (this.data.geom?.type) {
      if (this.data.geom.type === "MultiPolygon") {
        this.centroid = polylabel(this.data.geom.coordinates[0], 1.0);
      }
      this.layer = createGeoScopeLayer({
        geoScope: this.data,
        centroid: this.centroid,
        onClick: () => this.select("layer")
      });
      this.layer.bringToBack();
      map.addLayer(this.layer);

      // Add the layer only when we are sure there is some point
      // in the layer.
      pointStore.subscribe(
        (state) => [state.isLoading],
        ([isLoading]) => {
          const { map, mapReady } = configStore.getState();
          if (isLoading) return;
          // Points are loaded, we can check if the the layer is empty,
          // and thus remove it.
          if (this.isEmpty()) {
            if (map.hasLayer(this.layer) && mapReady) {
              map.removeLayer(this.layer);
            }
          }
        }
      );
    }
    this.repaint();
    return this;
  }
}
