const { createGeoScopeMenuItem, createGeoScopeLayer } = require("../../ui");

export default class GeoScope {
  constructor({ geoScope, map, menuElements, menuActions }) {
    //Model
    this.data = geoScope;
    this.isActive = false;
    this.isDisabled = false;

    //View
    this.map = map;
    this.menuElements = menuElements;
    this.menuActions = menuActions;
  }

  select() {
    this.isActive = true;

    this.menuElements.title.textContent = this.data.name.translation;
    const reset = L.DomUtil.create(
      "button",
      "decidimGeo__scopesDropdown__reset",
      this.menuElements.heading
    );
    reset.textContent = "reset";
    reset.onclick = this.menuActions.reset;

    this.layer.setStyle({ fillColor: "#2952A340", color: "#2952A3" });

    L.DomUtil.empty(this.menuElements.list);
    const loadingItem = L.DomUtil.create(
      "div",
      "decidimGeo__scopesDropdown__loading",
      this.menuElements.list
    );
    loadingItem.textContent += "Loading";
  }

  init() {
    this.layer = createGeoScopeLayer({
      geoScope: this.data,
      map: this.map,
    });
    this.menuItem = createGeoScopeMenuItem({
      label: this.data.name.translation,
      onClick: this.select.bind(this),
    });
  }
}
