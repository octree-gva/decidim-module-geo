const { getGeoDatasource } = require("../api");
const { default: GeoDatasourceNode } = require("../models/geoDatasourceNode");

const createGeoDatasourceLayer = async ({ map, mapConfig}) => {
  const response = await getGeoDatasource({
    variables: { filters: mapConfig.filters, locale: mapConfig.locale },
  });
  const nodesMarkers = [];
    response.nodes.map(node => {
      if (node?.coordinates?.latitude && node?.coordinates?.longitude) {
        const interactiveNode = new GeoDatasourceNode({
          node,
          map: map,
          mapConfig: mapConfig
        });
        interactiveNode.init();
        nodesMarkers.push(interactiveNode.marker);
      } else {
        console.log("Coordinates not found for ", node);
      }
    });
    return L.layerGroup(nodesMarkers);
  }

export default createGeoDatasourceLayer;

