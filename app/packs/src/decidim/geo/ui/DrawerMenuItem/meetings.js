import configStore from "../../models/configStore";
import createClasses from "../createClasses";
import { createDomElement } from "../createDomElement";
import _ from "lodash";
import { format, isSameDay } from "date-fns";

const meetings = (node) => {
  const { i18n, images } = configStore.getState();
  const listCard = createDomElement("li", "decidimGeo__drawer__listCard");
  const info = createDomElement(
    "div",
    "decidimGeo__drawer__listCardInfo decidimGeo__drawer__listCardInfo--large",
    listCard
  );

  const infoType = createDomElement("div", "decidimGeo__drawer__listCardType", info);
  infoType.textContent = i18n[node.type];
  const notGeoEncodedIcon = createDomElement(
    "img",
    createClasses("decidimGeo__drawer__listCardIcon", [node.coordinates && "hidden"]),
    infoType
  );
  notGeoEncodedIcon.src = images?.not_geolocated;

  const infoTitle = createDomElement("div", "decidimGeo__drawer__listCardTitle", info);
  infoTitle.textContent =
    node.title.translation || node.shortDescription.defaultTranslation;

  const infoDescription = createDomElement(
    "div",
    "decidimGeo__drawer__listCardDate",
    info
  );
  const infoStart = createDomElement(
    "strong",
    "decidimGeo__drawer__listCardStartDate",
    infoDescription
  );
  let displayedDate =
    format(node.startTime, "dd/MM/yy") + " — " + format(node.endTime, "dd/MM/yy");
  if (isSameDay(node.startTime, node.endTime)) {
    displayedDate = format(node.startTime, "dd/MM/yy");
  }
  infoStart.textContent = displayedDate;

  const infoStartSep = createDomElement(
    "span",
    "decidimGeo__drawer__listCardStartDateSep",
    infoDescription
  );
  infoStartSep.textContent = "·";

  const infoStartTime = createDomElement(
    "span",
    "decidimGeo__drawer__listCardStartTime",
    infoDescription
  );
  infoStartTime.textContent =
    format(node.startTime, "kk:mm") + "-" + format(node.endTime, "kk:mm");
  return listCard;
};

export default meetings;
