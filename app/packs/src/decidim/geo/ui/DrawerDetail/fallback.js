import _ from "lodash";
import configStore from "../../stores/configStore";
import createClasses from "../createClasses";
const fallback = (container, node) => {
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
  infoType.textContent = i18n[node.type];
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
  if (node.description) {
    const infoDescription = L.DomUtil.create(
      "div",
      "decidimGeo__drawer__listCardDescription decidimGeo__drawer__listCardDescription--large",
      container
    );
    infoDescription.innerHTML = node.description.translation;
  }
};
export default fallback;
