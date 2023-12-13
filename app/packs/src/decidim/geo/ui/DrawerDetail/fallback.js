import _ from "lodash";
import configStore from "../../models/configStore";
const fallback = (container, node) => {
  const { i18n } = configStore.getState();
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

  const infoTitle = L.DomUtil.create(
    "div",
    "decidimGeo__drawer__listCardTitle",
    container
  );
  infoTitle.textContent += node.title.translation;

  if (node.shortDescription) {
    const infoDescription = L.DomUtil.create(
      "div",
      "decidimGeo__drawer__listCardDescription decidimGeo__drawer__listCardDescription--large",
      container
    );
    infoDescription.textContent += _.truncate(
      node.shortDescription.translation.replace(/<[^>]+>/g, ""),
      800
    );
  }
};
export default fallback;
