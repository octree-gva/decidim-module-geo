import { createCustomMarker } from ".";

const createNodeMarker = (node) => {
  const location = [node.coordinates.latitude, node.coordinates.longitude];
  return createCustomMarker(location)
};



export default createNodeMarker;
