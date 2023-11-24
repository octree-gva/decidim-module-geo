const { createNodeMenuItem, createNodeMarker } = require("../../ui");
let selectedMarker = undefined;
export default class GeoDatasourceNode {
  constructor({ node, map, mapConfig, onClick}) {
    //Model
    this.data = node;
    this.map = map;
    this.mapConfig = mapConfig;
    this.selected = false;
    this.onClick = onClick
  }

  repaint() {
    if(selectedMarker === this)
      return this.marker.setStyle(this.selectedState)
    if (this.data.componentId == this.mapConfig.selected_component) 
      this.marker.setStyle(this.selectedState);
    else
      this.marker.setStyle(this.staledState)
  }

  colorLayers() {
    this.map.eachLayer( layer =>{
      if (layer.feature) {
        if (layer.feature.geometry.properties.id === this.scopeId) {
          layer.setStyle(this.selectedState) 
          this.map.panTo(layer.getCenter())
        }else {
          layer.setStyle(this.staledState)
        }
      }
    });
  }
  get scopeId(){
    return this.data.scope.id || undefined
  }

  get selectedState() {
    return { color: '#2952A3' }
  } 

  get staledState() {
    return { color: '#cccccc' }
  }

 
  unSelect() {
    selectedMarker = null;
    this.repaint();
  }

  panToMarker() {
    const center = L.latLng([this.data.coordinates.latitude, this.data.coordinates.longitude])
    this.marker?.bringToFront();
    this.map.panTo(
      center
    )
  }
  select(source="marker") {
    this.panToMarker();
    if(selectedMarker) {
      selectedMarker.unSelect();
    }
    selectedMarker = this;
    if(this.onClick) this.onClick(source);
    this.repaint();
  }

  init() {
    if (!this.data?.coordinates) {
      // This is not a marker
      return undefined;
    }
    try {
      this.marker = createNodeMarker(this.data);
      this.marker.on("click", this.select.bind(this));
      this.marker.bringToFront();
      this.repaint()
      this.menuItem = createNodeMenuItem({
        node: this.data,
        onClick: () => {
          this.select("sidebar")
        },
      });
    } catch (error) {
      console.log("init geo data error ", { error });
    }
    return this;
  }
}
