const { getGeoDatasource } = require("../api");
const { default: GeoDatasourceNode } = require("../models/geoDatasourceNode");

const createGeoDatasourceLayer = async ({ map, mapConfig}) => {
  const response = await getGeoDatasource({
    variables: { filters: mapConfig.filters, locale: mapConfig.locale },
  });
  const markers = response.nodes.map(node => {
    const interactiveNode = new GeoDatasourceNode({
      map: map,
      node,
      mapConfig
    });
    interactiveNode.init();
    return interactiveNode.marker;
  });
  if (markers.length > 0) return L.layerGroup(markers);
  throw new Error("This map is empty")
};

export default createGeoDatasourceLayer;
