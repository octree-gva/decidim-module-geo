import { createNodeMenuItem, createNodeMarker } from "../../ui";
import geoStore from "../geoStore";
import configStore from "../configStore";

export default class GeoDatasourceNode {
  constructor({ node, map }) {
    //Model
    this.data = node;
    this.map = map;
  }

  repaint() {
    const { selectedPoint } = geoStore.getState();
    const { selected_component } = configStore.getState();
    if (selectedPoint === this) {
      this.marker.setStyle(this.selectedState);
    } else if (this.data.componentId == selected_component) {
      this.marker.setStyle(this.selectedState);
    } else {
      this.marker.setStyle(this.staledState);
    }
  }

  colorLayers() {
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
    return this.data.id || undefined;
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
    const center = L.latLng([
      this.data.coordinates.latitude,
      this.data.coordinates.longitude
    ]);
    this.marker?.bringToFront();
    const { map } = configStore.getState();
    map.panTo(center);
  }

  select() {
    this.panToMarker();
    geoStore.getState().selectPoint(this);
    this.repaint();
  }

  init() {
    if (!this.data?.coordinates) {
      // This is not a marker
      console.log("This is not a marker");
      return undefined;
    }
    try {
      this.marker = createNodeMarker(this.data);
      this.marker.on("click", this.select.bind(this));
      this.marker.bringToFront();
      this.repaint();
      this.menuItem = createNodeMenuItem({
        node: this.data,
        onClick: () => {
          this.select("sidebar");
        }
      });

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
