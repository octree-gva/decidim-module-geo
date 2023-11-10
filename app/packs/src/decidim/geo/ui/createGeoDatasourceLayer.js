const { getGeoDatasource } = require("../api");
const { default: GeoDatasourceNode } = require("../models/geoDatasourceNode");

const createGeoDatasourceLayer = async ({ filters }) => {
  const response = await getGeoDatasource({
    variables: { filters },
  });
  const markers = response.nodes.map(node => {
    console.log("markers map", { node });
    const interactiveNode = new GeoDatasourceNode({
      node,
    });
    interactiveNode.init();
    return interactiveNode.marker;
  });
  if (markers.length > 0) return L.layerGroup(markers);
};

export default createGeoDatasourceLayer;
