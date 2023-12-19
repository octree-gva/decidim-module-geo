import _ from "lodash";
import { fallback, meetings } from "./DrawerMenuItem";

const createNodeMenuItem = (node) => {
  console.log(node.type, node.type === "Decidim::Meetings::Meeting");
  switch (node.type) {
    case "Decidim::Meetings::Meeting":
      return meetings(node);
    default:
      return fallback(node);
  }
};

export default createNodeMenuItem;
