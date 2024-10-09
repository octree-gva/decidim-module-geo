import _ from "lodash";
import configStore from "../../stores/configStore";
import createClasses from "../createClasses";
const fallback = (container, node) => {
  const { i18n, images, locale, defaultLocale } = configStore.getState();
  if (!_.isEmpty(node.imageUrl)) {
    const image = L.DomUtil.create(
      "img",
      "decidimGeo__drawer__listCardImg decidimGeo__drawer__listCardImg--large",
      container
    );
    image.src = node.imageUrl;
    container.className += " decidimGeo__drawer__listCardInfo--image";
  }

  const infoType = L.DomUtil.create("div", "decidimGeo__drawer__listCardType", container);
  infoType.textContent = i18n[node.resourceType];
  const notGeoEncodedIcon = L.DomUtil.create(
    "img",
    createClasses("decidimGeo__drawer__listCardIcon", [node.lonlat && "hidden"]),
    infoType
  );
  notGeoEncodedIcon.src = images?.not_geolocated;

  const infoTitle = L.DomUtil.create(
    "div",
    "decidimGeo__drawer__listCardTitle",
    container
  );
  infoTitle.textContent = node.title[locale] || node.title[defaultLocale];
  if (node.descriptionHtml) {
    const infoDescription = L.DomUtil.create(
      "div",
      "decidimGeo__drawer__listCardDescription decidimGeo__drawer__listCardDescription--large",
      container
    );
    infoDescription.innerHTML =
      node.descriptionHtml[locale] || node.descriptionHtml[defaultLocale];
  }
};
export default fallback;
