const { createNodeMenuItem, createNodeMarker } = require("../../ui");

const unselectPrevious = undefined;

export default class GeoDatasourceNode {
  constructor({ node, map }) {
    //Model
    this.data = node;
    this.map = map;
  }

  unSelect() {
    this.marker?.setStyle({ fillColor: "#000000", color: "#cccccc" });
  }

  select() {
    this.marker?.setStyle({ fillColor: "#2952A370", color: "#2952A3" });

    this.map.flyTo(
      [this.data.coordinates.latitude, this.data.coordinates.longitude],
      16
    );
    previousSelected.unSelect();
    previousSelected = this.bind();
  }

  init() {
    try {
      this.marker = createNodeMarker(this.data);
      this.menuItem = createNodeMenuItem({
        node: this.data,
        onClick: this.select.bind(this),
      });
    } catch (error) {
      console.log("init geo data error ", { error });
    }
  }
}
