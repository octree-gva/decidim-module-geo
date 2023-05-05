const {
  createMarker,
  createParticipatoryProcessMenuItem,
  createParticipatoryProcessLayer,
} = require("../../ui");

export default class GeoParticipatoryProcess {
  constructor({ participatoryProcess }) {
    //Model
    this.data = participatoryProcess;

  }

  select() {
    this.layer?.setStyle({ fillColor: "#2952A370", color: "#2952A3" });
  }

  unSelect() {
    this.layer?.setStyle({ fillColor: "#000000", color: "#cccccc" });
  }

  init() {
    this.layer = createParticipatoryProcessLayer({
      participatoryProcess: this.data,
    });
    this.menuItem = createParticipatoryProcessMenuItem({
      participatoryProcess: this.data,
      onClick: this.select.bind(this),
    });
  }
}
