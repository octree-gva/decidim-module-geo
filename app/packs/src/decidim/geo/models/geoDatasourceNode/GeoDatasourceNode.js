import { createNodeMenuItem, createNodeMarker } from "../../ui";
import geoStore from "../geoStore";
import configStore from "../configStore";

export default class GeoDatasourceNode {
  constructor({ node, map }) {
    //Model
    this.data = node;
    this.map = map;
    this.marker = undefined;
  }

  isGeoLocated() {
    return this.marker;
  }

  repaint() {
    const { selectedPoint } = geoStore.getState();
    const { selected_component, selected_point: pinPoint } = configStore.getState();

    if(this.isGeoLocated()) {
      if(pinPoint) {
        if (selectedPoint === this) {
          this.marker.setStyle(this.selectedState);
          this.marker.bringToFront();
        } else if (!selectedPoint && this.data.componentId == selected_component && pinPoint == `${this.data.id}`) {
          this.marker.setStyle(this.selectedState);
          this.marker.bringToFront();
        } else {
          this.marker.setStyle(this.staledState);
        }
      }else {
        if (selectedPoint === this) {
          this.marker.setStyle(this.selectedState);
          this.marker.bringToFront();
        } else if (!selectedPoint && this.data.componentId == selected_component) {
          this.marker.setStyle(this.selectedState);
          this.marker.bringToFront();
        } else {
          this.marker.setStyle(this.staledState);
        }
      }
    }
  }

  colorLayers() {
    if(!this.isGeoLocated()) return;
    const { map } = configStore.getState();
    map.eachLayer((layer) => {
      if (layer.feature) {
        if (layer.feature.geometry.properties.id === this.scopeId) {
          layer.setStyle(this.selectedState);
          map.panTo(layer.getCenter());
        } else {
          layer.setStyle(this.staledState);
        }
      }
    });
  }

  get id() {
    if (!this.data.id || !this.data.type) return undefined;
    return `${this.data.type}::${this.data.id}`;
  }

  get scopeId() {
    return this.data.scope?.id || undefined;
  }

  get selectedState() {
    return { color: "var(--primary)" };
  }

  get staledState() {
    return { color: "#404040" };
  }

  panToMarker() {
    if(!this.isGeoLocated()) return;
    const center = L.latLng([
      this.data.coordinates.latitude,
      this.data.coordinates.longitude
    ]);
    this.marker?.bringToFront();
    const { map } = configStore.getState();
    map.panTo(center);
  }

  select() {
    if(this.isGeoLocated())
      this.panToMarker();
    geoStore.getState().selectPoint(this);
    this.repaint();
  }

  init() {
    if (this.data?.coordinates) {
      this.marker = createNodeMarker(this.data);
      this.marker.on("click", this.select.bind(this));
      this.marker.bringToFront();
    }
    try {
      this.repaint();
      this.menuItem = createNodeMenuItem(this.data);
      this.menuItem.onclick = () => {
        this.select("sidebar");
      }

      geoStore.subscribe(
        (state) => [state.selectedPoint],
        (_np, [unselectedPoint]) => {
          if (unselectedPoint) unselectedPoint.repaint();
          this.repaint();
        }
      );
    } catch (error) {
      console.log("ERROR: decidim-geo can't initialize ", { error });
    }
    return this;
  }
}
