const { createGeoScopeMenuItem, createGeoScopeLayer } = require("../../ui");

export default class GeoScope {
  constructor({ geoScope, map, menuElements }) {
    //Model
    this.data = geoScope;
    this.isActive = false;
    this.isDisabled = false;

    //View
    this.map = map;
    this.menuElements = menuElements;
  }

  select() {
    this.isActive = true;

    console.log(this.menuElements);
    this.menuElements.title.textContent = this.data.name.translation;
    const reset = L.DomUtil.create(
      "button",
      "decidimGeo__scopesDropdown__reset",
      this.menuElements.heading
    );
    reset.textContent = "reset";
    reset.onclick = reset;

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
      listElement: this.menuElements.list,
      onClick: this.select.bind(this),
    });
  }
}
