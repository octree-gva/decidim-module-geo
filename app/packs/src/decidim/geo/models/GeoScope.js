import { scopeDropdownItem, scopeGeoLayer } from "./../ui";
import geoStore from "../stores/geoStore";
import pointStore from "../stores/pointStore";
import configStore from "../stores/configStore";
import polylabel from "polylabel";
import _ from "lodash";

export default class GeoScope {
  constructor({ geoScope }) {
    //Model
    this.data = geoScope;
    this.markers_group = [];
    this.menuItem = null;
    this.menuItemRepaint = () => {};
  }

  get activeState() {
    return { fillColor: "#2952A370", color: "#2952A3" };
  }

  isEmpty(points = undefined) {
    if (!points) points = pointStore.getState().points;
    if (this.data.geom === null) return true;
    const currentScopeId = this.id;
    return !points.find(({ geoScopeId }) => `${geoScopeId}` === `${currentScopeId}`);
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
    if (selectedScope) return selectedScope.id === this.id;
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
  get geom() {
    return this.data.geom;
  }

  get id() {
    return parseInt(`${this.data.id}`);
  }

  nodesForScope() {
    const { points } = pointStore.getState();
    const currentScopeId = this.id;
    return points
      .filter(({ geoScopeId }) => `${geoScopeId}` === `${currentScopeId}`)
      .filter(Boolean);
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

  scopeClickHandler() {
    this.select("layer");
  }
  remove() {
    const { map } = configStore.getState();
    map.removeLayer(this.layer);
  }
  init(mapLayer) {
    this.markers_group = this.markersForScope();
    const [itm, repaintItm] = scopeDropdownItem({
      scopeId: this.id,
      label: this.name,
      onClick: () => {
        geoStore.getState().selectScope(this);
        this.repaint();
      }
    });
    this.menuItem = itm;
    this.menuItemRepaint = repaintItm;
    if (this.data.geom?.type) {
      if (this.data.geom.type === "MultiPolygon") {
        this.centroid = polylabel(this.data.geom.coordinates[0], 1.0);
      }
      this.layer = scopeGeoLayer({
        geoScope: this.data,
        centroid: this.centroid,
        onClick: this.scopeClickHandler.bind(this)
      });
      this.layer.bringToBack();
      mapLayer.addLayer(this.layer);

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
