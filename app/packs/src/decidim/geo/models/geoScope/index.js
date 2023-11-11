const { createGeoScopeMenuItem, createGeoScopeLayer } = require("../../ui");
const { getGeoDatasource } = require("../../api");
const { default: GeoDatasourceNode } = require("../geoDatasourceNode");

const polylabel = require("polylabel");

export default class GeoScope {
  constructor({ geoScope, map, menuElements, menuActions, mapConfig }) {
    //Model
    this.data = geoScope;
    this.nodes = [];
    this.isActive = false;
    this.mapConfig = mapConfig || {}

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
    if (this.centroid) {
      this.map.panTo([this.centroid[1], this.centroid[0]]);
    }
    this.nodes.forEach(node => {
      this.menuElements.list.appendChild(node.menuItem);
    });
    this.nodesLayer?.addTo(this.map);
    this.nodesLayer?.setStyle({ fillColor: "#2952A370", color: "#2952A3" });
  }

  unSelect() {
    this.isActive = false;
    this.nodes.forEach(node => {
      this.map.removeLayer(this.nodesLayer);
    });
    this.layer.setStyle({ fillColor: "#cccccc", color: "#999999" });
  }

  async loadGeoDatasource() {
    const response = await getGeoDatasource({
      variables: { filters: [{ scopeFilter: { scopeId: this.data.id } }] },
    });
    const nodesMarkers = [];
    response.nodes.map(node => {
      if (node?.coordinates?.latitude && node?.coordinates?.longitude) {
        const interactiveNode = new GeoDatasourceNode({
          node,
          map: this.map,
          mapConfig
        });
        interactiveNode.init();
        this.nodes.push(interactiveNode);
        nodesMarkers.push(interactiveNode.marker);
      } else {
        console.log("Coordinates not found for ", node);
      }
    });
    this.nodesLayer = L.layerGroup(nodesMarkers);
  }

  async init() {
    await this.loadGeoDatasource();
    if (this.data.geom?.type === "MultiPolygon") {
      this.centroid = polylabel(this.data.geom.coordinates[0], 1.0);
    }
    if (this.nodes.length > 0) {
      this.layer = createGeoScopeLayer({
        geoScope: this.data,
        map: this.map,
        centroid: this.centroid,
        onClick: this.select.bind(this),
      });
      this.menuItem = createGeoScopeMenuItem({
        label: this.data.name.translation,
        onClick: this.select.bind(this),
      });
    }
  }
}
