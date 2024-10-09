import configStore from "../../stores/configStore";
import createClasses from "../createClasses";
import _ from "lodash";
import { format, isSameDay } from "date-fns";

const meetings = (node) => {
  const { i18n, images, locale, defaultLocale } = configStore.getState();
  const listCard = L.DomUtil.create("li", "decidimGeo__drawer__listCard");
  const info = L.DomUtil.create(
    "div",
    "decidimGeo__drawer__listCardInfo decidimGeo__drawer__listCardInfo--large",
    listCard
  );

  const infoType = L.DomUtil.create("div", "decidimGeo__drawer__listCardType", info);
  infoType.textContent = i18n[node.resourceType];
  const notGeoEncodedIcon = L.DomUtil.create(
    "img",
    createClasses("decidimGeo__drawer__listCardIcon", [node.lonlat && "hidden"]),
    infoType
  );
  notGeoEncodedIcon.src = images?.not_geolocated;

  const infoTitle = L.DomUtil.create("div", "decidimGeo__drawer__listCardTitle", info);
  infoTitle.textContent = node.title[locale] || node.title[defaultLocale];

  const infoDescription = L.DomUtil.create(
    "div",
    "decidimGeo__drawer__listCardDate",
    info
  );
  const infoStart = L.DomUtil.create(
    "strong",
    "decidimGeo__drawer__listCardStartDate",
    infoDescription
  );
  let displayedDate =
    format(node.startDate, "dd/MM/yy") + " — " + format(node.endDate, "dd/MM/yy");
  if (isSameDay(node.startDate, node.endDate)) {
    displayedDate = format(node.startDate, "dd/MM/yy");
  }
  infoStart.textContent = displayedDate;

  const infoStartSep = L.DomUtil.create(
    "span",
    "decidimGeo__drawer__listCardStartDateSep",
    infoDescription
  );
  infoStartSep.textContent = "·";

  const infoStartTime = L.DomUtil.create(
    "span",
    "decidimGeo__drawer__listCardStartTime",
    infoDescription
  );
  if (node.extendedData)
    infoStartTime.textContent =
      format(node.extendedData.startTime, "kk:mm") +
      "-" +
      format(node.extendedData.endTime, "kk:mm");
  return listCard;
};

export default meetings;
