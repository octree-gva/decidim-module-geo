import configStore from "../../stores/configStore";
import createClasses from "../createClasses";
import _ from "lodash";

const fallback = (node) => {
  const { i18n, images, locale, defaultLocale } = configStore.getState();
  const hasImage = !_.isEmpty(node.imageUrl);
  const listCard = L.DomUtil.create("li", "decidimGeo__drawer__listCard");

  const info = L.DomUtil.create(
    "div",
    createClasses("decidimGeo__drawer__listCardInfo", [!hasImage && "large"]),
    listCard
  );

  const infoType = L.DomUtil.create("div", "decidimGeo__drawer__listCardType", info);
  infoType.textContent += i18n[node.resourceType];
  const notGeoEncodedIcon = L.DomUtil.create(
    "img",
    createClasses("decidimGeo__drawer__listCardIcon", [node.lonlat && "hidden"]),
    infoType
  );
  notGeoEncodedIcon.src = images?.not_geolocated;

  const infoTitle = L.DomUtil.create("div", "decidimGeo__drawer__listCardTitle", info);
  infoTitle.textContent = node.title[locale] || node.title[defaultLocale];

  if (node.shortDescription) {
    const infoDescription = L.DomUtil.create(
      "div",
      "decidimGeo__drawer__listCardDescription",
      info
    );
    infoDescription.textContent =
      node.shortDescription[locale] || node.shortDescription[defaultLocale];
  }

  if (hasImage) {
    const image = L.DomUtil.create("img", "decidimGeo__drawer__listCardImg", listCard);
    image.src = node.imageUrl;
  }
  return listCard;
};

export default fallback;
