import _ from "lodash";
import { fallback, meetings } from "./DrawerMenuItem";

const createNodeMenuItem = (node) => {
  switch (node.type) {
    case "Decidim::Meetings::Meeting":
      return meetings(node);
    default:
      return fallback(node);
  }
};

export default createNodeMenuItem;
