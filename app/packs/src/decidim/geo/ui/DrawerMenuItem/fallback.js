import configStore from "../../models/configStore";
import createClasses from "../createClasses";
import { createDomElement } from "../createDomElement";
import _ from "lodash";

const fallback = (node) => {
  const { i18n, images } = configStore.getState();
  const hasImage = !_.isEmpty(node.bannerImage);
  const listCard = createDomElement("li", "decidimGeo__drawer__listCard");

  const info = createDomElement(
    "div",
    createClasses("decidimGeo__drawer__listCardInfo", [!hasImage && "large"]),
    listCard
  );

  const infoType = createDomElement("div", "decidimGeo__drawer__listCardType", info);
  infoType.textContent += i18n[node.type];
  const notGeoEncodedIcon = createDomElement(
    "img",
    createClasses("decidimGeo__drawer__listCardIcon", [node.coordinates && "hidden"]),
    infoType
  );
  notGeoEncodedIcon.src = images?.not_geolocated;

  const infoTitle = createDomElement("div", "decidimGeo__drawer__listCardTitle", info);
  infoTitle.textContent = node.title.translation || node.title.defaultTranslation;

  if (node.shortDescription) {
    const infoDescription = createDomElement(
      "div",
      "decidimGeo__drawer__listCardDescription",
      info
    );
    infoDescription.textContent =
      node.shortDescription.translation || node.shortDescription.defaultTranslation;
  }

  if (hasImage) {
    const image = createDomElement("img", "decidimGeo__drawer__listCardImg", listCard);
    image.src = node.bannerImage;
  }
  return listCard;
};

export default fallback;
