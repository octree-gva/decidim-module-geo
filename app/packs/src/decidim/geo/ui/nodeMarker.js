import { customMarker } from ".";

const nodeMarker = (node) => {
  if (!node.lonlat?.latitude || !node.lonlat?.longitude) return null;
  const location = [node.lonlat.latitude, node.lonlat.longitude];
  return customMarker(location);
};

export default nodeMarker;
