import { item as drawerListItem, nodeMarker } from "../ui";
import geoStore from "../stores/geoStore";
import configStore from "../stores/configStore";

export default class GeoDatasourceNode {
  constructor({ node, map }) {
    //Model
    this.data = node;
    this.map = map;
    this.marker = undefined;
  }

  isGeoLocated() {
    return !!this.marker;
  }

  repaint() {
    const { selectedPoint } = geoStore.getState();
    const { selected_component, selected_point: pinPoint } = configStore.getState();
    if (this.isGeoLocated()) {
      if (pinPoint) {
        if (selectedPoint === this) {
          this.marker.setStyle(this.selectedState);
        } else if (
          !selectedPoint &&
          `${this.data.componentId}` == `${selected_component}` &&
          pinPoint == `${this.data.id}`
        ) {
          this.marker.setStyle(this.selectedState);
          this.marker.bringToFront();
        } else {
          this.marker.setStyle(this.staledState);
        }
      } else {
        if (selectedPoint === this) {
          this.marker.setStyle(this.selectedState);
        } else if (
          !selectedPoint &&
          `${this.data.componentId}` === `${selected_component}`
        ) {
          this.marker.setStyle(this.selectedState);
        } else {
          this.marker.setStyle(this.staledState);
        }
      }
    }
  }

  colorLayers() {
    if (!this.isGeoLocated()) return;
    const { map } = configStore.getState();
    map.eachLayer((layer) => {
      if (layer.feature) {
        if (layer.feature.geometry.properties.id === this.scopeId) {
          layer.setStyle(this.selectedState);
        } else {
          layer.setStyle(this.staledState);
        }
      }
    });
  }

  get type() {
    if (!this.data.id || !this.data.type) return undefined;
    return this.data.type;
  }

  get id() {
    if (!this.data.id || !this.data.type) return undefined;
    return `${this.data.type}::${this.data.id}`;
  }

  get scopeId() {
    return parseInt(`${this.data.scope?.id}`) || undefined;
  }

  get selectedState() {
    return { color: "var(--primary)" };
  }

  get staledState() {
    return { color: "#404040" };
  }

  async panToMarker(zoom = 21) {
    if (!this.isGeoLocated()) return;
    const { map } = configStore.getState();
    return new Promise((resolve) => {
      map
        .flyTo(this.marker.getLatLng(), zoom, {
          animate: false,
          noMoveStart: true
        })
        .once("moveend", () => {
          this.repaint();
          resolve();
        });
    });
  }

  select() {
    geoStore.getState().selectPoint(this);
  }

  init() {
    if (this.data?.coordinates?.latitude && this.data?.coordinates?.longitude) {
      this.marker = nodeMarker(this.data);
      this.marker.on("click", this.select.bind(this));
      this.marker.bringToFront();
    }
    try {
      this.repaint();
      this.menuItem = drawerListItem(this.data);
      this.menuItem.onclick = this.select.bind(this);

      geoStore.subscribe(
        (state) => [state.selectedPoint],
        (_np, [unselectedPoint]) => {
          if (unselectedPoint) unselectedPoint.repaint();
          this.repaint();
        }
      );
    } catch (error) {
      console.error("ERROR: decidim-geo can't initialize ", { error });
    }
    return this;
  }
}
