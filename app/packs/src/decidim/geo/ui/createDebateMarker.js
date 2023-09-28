import { createCustomMarker } from ".";

const createDebateMarker = ({ node, location, href }) => {
  return createCustomMarker(location).bindPopup(node.title.translation);
};

export default createDebateMarker;
