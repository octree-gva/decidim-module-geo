const { createGeoScopeMenuItem, createGeoScopeLayer } = require("../../ui");
const { getGeoDatasource } = require("../../api");
const { default: GeoDatasourceNode } = require("../geoDatasourceNode");

const polylabel = require("polylabel");

let previousScope = null;

export default class GeoScope {
  constructor({ geoScope, mapConfig, map, menuElements, selectScope, selectAllScopes }) {
    //Model
    this.data = geoScope;
    this.loading = true;
    this.nodes = [];
    this.mapConfig = mapConfig || {}
    this.oldLayer = null;

    //View
    this.map = map;
    this.menuElements = menuElements;
    this.selectScope = selectScope;
    this.selectAllScopes = selectAllScopes;
    this.nodesLayer = L.layerGroup()
  }

  get activeState() {
    return { fillColor: '#2952A3', color: '#ffffff' }
  }

  isEmpty() {
    return this.nodes.length === 0;
  }

  isLoading() {
    return this.loading;
  }

  get staledState() {
    return { fillColor: '#ffffff', color: '#ffffff' }
  }

  redefineResetBtn() {
    this.menuElements.resetBtn.onclick = () => {
      this.unSelect();
      this.selectAllScopes()
    };
  }

  select(source="marker") {
    if(previousScope === this)
    return;
    // If the source of click is not the shape
    // in the map, we do only a pan to. 
    // This is a discorvery mode.
    if(source === "marker"){
      if (this.centroid) {
        this.map.panTo([this.centroid[1], this.centroid[0]]);
      }
      return
    }
    if(previousScope) previousScope.unSelect();
    previousScope = this
    this.selectScope(this, source);
    this.redefineResetBtn()
    if (this.centroid) {
      this.map.panTo([this.centroid[1], this.centroid[0]]);
    }
    this.repaint();
  }

  /**
   * If the current marker is selected (active)
   * @returns boolean 
   */
  isActive() {
    return previousScope === this;
  }

  repaint() {
    if(this.isActive()) {
      this.layer.setStyle(this.activeState);
    }else{
      this.layer.setStyle(this.staledState);
    }
  }

  unSelect() {
    previousScope = null;
    this.repaint();
  }

  get name() {
    return this.data.name.translation;
  }

  async loadGeoDatasource() {
    const response = await getGeoDatasource({
      variables: { filters: [{ scopeFilter: { scopeId: this.data.id } }] },
    });
    this.nodes = response.nodes.map(node => {
      const interactiveNode = new GeoDatasourceNode({
        node,
        map: this.map,
        mapConfig: this.mapConfig,
        onClick: this.select.bind(this)
      });
      if(interactiveNode.init()){
        interactiveNode.marker.addTo(this.nodesLayer)
        return interactiveNode
      }
      return undefined;
    }).filter(Boolean);
  }

  async init() {
    this.loading = true;
    await this.loadGeoDatasource();
    this.loading = false;

    if(this.isEmpty()){
      return;
    }
   const onLayerClick = () => {
    this.select("layer")
   }
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
    this.layer.addTo(this.map);
    this.menuItem = createGeoScopeMenuItem({
      label: this.name,
      onClick: () => {
        this.select("layer");
      }
    });
    this.repaint();
    this.nodesLayer?.addTo(this.map);

    return this;
  }
}
