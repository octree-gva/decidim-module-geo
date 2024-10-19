import _ from "lodash";
import { fallback, meetings, proposals } from ".";

const item = (node) => {
  switch (node.resourceType) {
    case "meetings":
      return meetings(node);
      case "proposals":
        return proposals(node);
        case "reporting_proposals":
          return proposals(node);
        default:
      return fallback(node);
  }
};

export default item;
