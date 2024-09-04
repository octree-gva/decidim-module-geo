import _ from "lodash";
import { fallback, meetings } from ".";

const item = (node) => {
  switch (node.type) {
    case "Decidim::Meetings::Meeting":
      return meetings(node);
    default:
      return fallback(node);
  }
};

export default item;
