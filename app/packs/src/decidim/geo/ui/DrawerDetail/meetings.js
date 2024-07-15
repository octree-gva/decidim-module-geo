import _ from "lodash";
import configStore from "../../models/configStore";
import createClasses from "../createClasses";
import { format, isSameDay } from "date-fns";

const meetings = (container, node) => {
  const { i18n, images } = configStore.getState();
  if (!_.isEmpty(node.bannerImage)) {
    const image = L.DomUtil.create(
      "img",
      "decidimGeo__drawer__listCardImg decidimGeo__drawer__listCardImg--large",
      container
    );
    image.src = node.bannerImage;
    container.className += " decidimGeo__drawer__listCardInfo--image";
  }

  const infoType = L.DomUtil.create("div", "decidimGeo__drawer__listCardType", container);
  infoType.textContent += i18n[node.type];
  const notGeoEncodedIcon = L.DomUtil.create(
    "img",
    createClasses("decidimGeo__drawer__listCardIcon", [node.coordinates && "hidden"]),
    infoType
  );
  notGeoEncodedIcon.src = images?.not_geolocated;
  const infoTitle = L.DomUtil.create(
    "div",
    "decidimGeo__drawer__listCardTitle",
    container
  );
  infoTitle.textContent = node.title.translation || node.title.defaultTranslation;
  const infoDescription = L.DomUtil.create(
    "div",
    "decidimGeo__drawer__listCardDate",
    container
  );
  const infoStart = L.DomUtil.create(
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

  const infoStartSep = L.DomUtil.create(
    "div",
    "decidimGeo__drawer__listCardStartDateSep",
    infoDescription
  );
  infoStartSep.textContent = "·";

  const infoStartTime = L.DomUtil.create(
    "div",
    "decidimGeo__drawer__listCardStartTime",
    infoDescription
  );
  infoStartTime.textContent =
    format(node.startTime, "kk:mm") + "-" + format(node.endTime, "kk:mm");

  if (node.description) {
    const infoDescription = L.DomUtil.create(
      "div",
      "decidimGeo__drawer__listCardDescription decidimGeo__drawer__listCardDescription--large decidimGeo__drawer__listCardDescription--meetings",
      container
    );
    infoDescription.textContent = _.truncate(
      node.description.translation || node.description.defaultTranslation,
      {
        length: 2500
      }
    );
  }
};
export default meetings;
