import { createGeoScopeMenuItem, createGeoScopeLayer } from "../../ui";
import geoStore from "../geoStore";
import pointStore from "../pointStore";
import configStore from "../configStore";
import scopeDropdownStore from "../scopeDropdownStore";
import polylabel from "polylabel";

export default class GeoScope {
  constructor({ geoScope }) {
    //Model
    this.data = geoScope;
    this.oldLayer = null;
    this.markers_group = [];
    this.menuItem = null;
  }

  get activeState() {
    return { fillColor: "#2952A370", color: "#2952A3" };
  }

  isEmpty() {
    const { points } = pointStore.getState();
    const currentScopeId = this.id;
    return !points.find(({ scopeId }) => scopeId === currentScopeId);
  }

  isLoading() {
    return pointStore.getState().isLoading;
  }

  get staledState() {
    return { fillColor: "#cccccc", color: "#999999" };
  }

  select(source = "marker") {
    const { map } = configStore.getState();

    const { selectedScope: previousScope } = geoStore.getState();
    geoStore.getState().selectScope(this);

    if (previousScope === this) return;

    // If the source of click is not the shape
    // in the map, we do only a pan to.
    // This is a discovery mode.
    if (source === "marker") {
      if (this.centroid) {
        map.panTo([this.centroid[1], this.centroid[0]]);
      }
      return;
    } // TODO: check if this is used in some cenario
    if (previousScope) previousScope.repaint();

    if (this.centroid) {
      let group = L.featureGroup(this.markers_group);
      map.fitBounds(group.getBounds());
    }
    this.repaint();
  }

  /**
   * If the current marker is selected (active)
   * @returns boolean
   */
  isActive() {
    const { selectedScope } = geoStore.getState();
    return selectedScope === this;
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
    return this.data.id;
  }

  nodesForScope() {
    const { points } = pointStore.getState();
    const currentScopeId = this.id;
    return points.filter(({ scopeId }) => scopeId === currentScopeId).filter(Boolean);
  }

  markersForScope() {
    return this.nodesForScope().map(({ marker }) => marker);
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
    if (this.data.geom) {
      if (this.data.geom.type === "MultiPolygon") {
        this.centroid = polylabel(this.data.geom.coordinates[0], 1.0);
      }
      this.layer = createGeoScopeLayer({
        geoScope: this.data,
        centroid: this.centroid,
        onClick: () => this.select("layer")
      });
      this.layer.bringToBack();
      // Add the layer only when we are sure there is some point
      // in the layer.
      pointStore.subscribe(
        (state) => [state.isLoading, state.points],
        ([isLoading, points]) => {
          if (isLoading || points.length === 0) return;
          if (this.isEmpty()) {
            if (map.hasLayer(this.layer)) {
              map.removeLayer(this.layer);
            }
          } else {
            map.addLayer(this.layer);
          }
        }
      );
    }
    this.repaint();

    return this;
  }
}
