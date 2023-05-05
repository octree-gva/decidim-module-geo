const { createGeoScopeMenuItem, createGeoScopeLayer } = require("../../ui");
const { getParticipatoryProcesses } = require("../../api");
const { default: GeoParticipatoryProcess } = require("../participatoryProcess");

export default class GeoScope {
  constructor({ geoScope, map, menuElements, menuActions }) {
    //Model
    this.data = geoScope;
    this.participatoryProcessesList = [];
    this.isActive = false;
    this.isDisabled = false;

    //View
    this.map = map;
    this.menuElements = menuElements;
    this.menuActions = menuActions;
  }

  async select() {
    this.isActive = true;
    this.menuActions.reset();
    this.menuActions.switchIsListOpened(true);

    this.menuElements.title.textContent = this.data.name.translation;
    const reset = L.DomUtil.create(
      "button",
      "decidimGeo__scopesDropdown__reset",
      this.menuElements.heading
    );
    reset.textContent = "reset";
    reset.onclick = this.menuActions.reset;

    this.layer.setStyle({ fillColor: "#2952A370", color: "#2952A3" });

    L.DomUtil.empty(this.menuElements.list);
    const loadingItem = L.DomUtil.create(
      "div",
      "decidimGeo__scopesDropdown__loading",
      this.menuElements.list
    );
    loadingItem.textContent += "Loading";

    L.DomUtil.empty(this.menuElements.list);
    L.DomUtil.addClass(
      this.menuElements.list,
      "decidimGeo__scopesDropdown__list--card"
    );
    this.participatoryProcessesList.forEach(geoParticipatoryProcess => {
      geoParticipatoryProcess.layer?.addTo(map);
      this.menuElements.list.appendChild(geoParticipatoryProcess.menuItem);
    });
  }

  unSelect() {
    this.isActive = false;

    this.layer.setStyle({ fillColor: "#cccccc", color: "#999999" });
  }

  async loadParticipatoryProcesses() {
    const participatoryProcesses = await getParticipatoryProcesses({
      variables: { filter: { scopeId: this.data.id } },
    });
    this.participatoryProcessesList = participatoryProcesses.map(
      participatoryProcess => {
        const geoParticipatoryProcess = new GeoParticipatoryProcess({
          participatoryProcess,
        });
        geoParticipatoryProcess.init();
        return geoParticipatoryProcess;
      }
    );
    this.isDisabled = this.participatoryProcessesList.length === 0;
  }

  async init() {
    await this.loadParticipatoryProcesses();
    this.layer = createGeoScopeLayer({
      geoScope: this.data,
      map: this.map,
      onClick: this.select.bind(this),
    });
    this.menuItem = createGeoScopeMenuItem({
      label: this.data.name.translation,
      onClick: this.select.bind(this),
    });
  }
}
