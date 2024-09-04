import { customMarker } from ".";

const nodeMarker = (node) => {
  if (!node.coordinates?.latitude || !node.coordinates?.longitude) return null;
  const location = [node.coordinates.latitude, node.coordinates.longitude];
  return customMarker(location);
};

export default nodeMarker;
