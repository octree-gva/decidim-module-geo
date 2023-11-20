const { createGeoScopeMenuItem, createGeoScopeLayer } = require("../../ui");
const { getGeoDatasource } = require("../../api");
const { default: GeoDatasourceNode } = require("../geoDatasourceNode");

const polylabel = require("polylabel");

let previousLayer = null;

export default class GeoScope {
  constructor({ geoScope, mapConfig, map, menuElements, menuActions }) {
    //Model
    this.data = geoScope;
    this.nodes = [];
    this.isActive = false;
    this.mapConfig = mapConfig || {}
    this.oldLayer = null;


    //View
    this.map = map;
    this.menuElements = menuElements;
    this.menuActions = menuActions;
  }

  geoScopeLayerColors() {
    if (this.data.id == this.mapConfig.space_id) {
      this.layer.setStyle({ fillColor: '#2952A370', color: '#2952A3' });
      this.map.panTo(this.layer.getCenter())
    } 
  }

  select() {
    this.isActive = true;

    if (previousLayer) {
      if (previousLayer !== this.layer) {
        previousLayer.setStyle({fillColor: "#cccccc", color: "#999999"})
        this.menuItem = createGeoScopeMenuItem({
          label: this.data.name.translation,
          onClick: this.select.bind(this),
        });
        
      }
      this.menuActions.reset();
    }

    this.menuActions.switchIsListOpened(true);

    this.menuElements.title.textContent = this.data.name.translation;

    //reset
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
    previousLayer = this.layer
    this.nodesLayer?.addTo(this.map);
  }

  unSelect() {
    this.isActive = false;
    this.data.forEach(data => {
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
      const interactiveNode = new GeoDatasourceNode({
        node,
        map: this.map,
        mapConfig: this.mapConfig
      });
      interactiveNode.init();
      this.nodes.push(interactiveNode);
      if (interactiveNode.marker) {
        nodesMarkers.push(interactiveNode.marker);
      } 
    });
    this.nodesLayer = L.layerGroup(nodesMarkers);
  }

  async init() {
    await this.loadGeoDatasource();

    const onLayerClick = this.select.bind(this);

    if (this.data.geom?.type === "MultiPolygon") {
      this.centroid = polylabel(this.data.geom.coordinates[0], 1.0);
    }   
    this.layer = createGeoScopeLayer({
      geoScope: this.data,
      map: this.map,
      centroid: this.centroid,
      onClick: onLayerClick,
    });
    this.layer.bringToBack();
    this.geoScopeLayerColors();
    this.menuItem = createGeoScopeMenuItem({
      label: this.data.name.translation,
      onClick: this.select.bind(this),
    });
  }
}
