import { createCustomMarker } from ".";

const createProposalMarker = ({ node, location, href }) => {
  return createCustomMarker(location).bindPopup(node.title.translation);
};

export default createProposalMarker;
