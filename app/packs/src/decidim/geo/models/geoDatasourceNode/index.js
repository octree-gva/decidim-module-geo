const { createNodeMenuItem, createNodeMarker } = require("../../ui");
let previousSelected = undefined;
export default class GeoDatasourceNode {
  constructor({ node, map, mapConfig }) {
    //Model
    this.data = node;
    this.map = map;
    this.mapConfig = mapConfig;
  }

  componentMarkersColors() {
    if (this.data.componentId == this.mapConfig.selected_component) {
      this.marker.setStyle({ fillColor: '#2952A370', color: '#2952A3' });
    } 
  }

  unSelect() {
    this.marker?.setStyle({ fillColor: "#000000", color: "#cccccc" });
    this.componentMarkersColors()
  }

  select() {
    const center = L.latLng([this.data.coordinates.latitude, this.data.coordinates.longitude])
    this.marker?.bringToFront();
    this.marker?.setStyle({ fillColor: "#2952A370", color: "#2952A3" })
    this.map.panTo(
      center
    )
    if(previousSelected) {
      previousSelected.unSelect();
    }
    previousSelected = this;
  }

  init() {
    try {
      const onMarkerClick = this.select.bind(this);
      const onPopupClosed = this.unSelect.bind(this);

      this.marker = createNodeMarker(this.data);
      this.marker.on("click", onMarkerClick);
      this.marker.getPopup().on('remove', onPopupClosed)
      this.componentMarkersColors()
      this.marker.bringToFront();
      this.menuItem = createNodeMenuItem({
        node: this.data,
        onClick: onMarkerClick,
      });
    } catch (error) {
      console.log("init geo data error ", { error });
    }
  }
}
