import { createCustomMarker } from ".";

const createNodeMarker = (node) => {
  if(!node.coordinates?.latitude || !node.coordinates?.longitude) return null;
  const location = [node.coordinates.latitude, node.coordinates.longitude];
  return createCustomMarker(location);
};

export default createNodeMarker;
