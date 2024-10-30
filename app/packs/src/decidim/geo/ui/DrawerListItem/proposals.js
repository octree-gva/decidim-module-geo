import configStore from "../../stores/configStore";
import createClasses from "../createClasses";
import _ from "lodash";

const proposals = (node) => {
  const { i18n, images, locale, defaultLocale } = configStore.getState();
  const hasImage = !_.isEmpty(node.imageUrl);
  const states = i18n["decidim.geo.proposals.states"]
  const listCard = L.DomUtil.create("li", "decidimGeo__drawer__listCard decidimGeo__drawer__listCard--proposals");
  const info = L.DomUtil.create(
    "div",
    "decidimGeo__drawer__listCardInfo decidimGeo__drawer__listCardInfo--large",
    listCard
  );
  const metadatas = L.DomUtil.create("div", "decidimGeo__drawer__metas", info);

  const infoType = L.DomUtil.create("div", "decidimGeo__drawer__listCardType", metadatas);
  infoType.textContent = i18n[node.resourceType];

  const notGeoEncodedIcon = L.DomUtil.create(
    "img",
    createClasses("decidimGeo__drawer__listCardIcon", [node.lonlat && "hidden"]),
    infoType
  );
  notGeoEncodedIcon.src = images?.not_geolocated;

  const infoTitle = L.DomUtil.create("div", "decidimGeo__drawer__listCardTitle", info);
  infoTitle.textContent = node.title[locale] || node.title[defaultLocale];
  const status = node.resourceStatus || "published"
  if(status){
      const infoStatus = L.DomUtil.create(
        "div",
        createClasses("decidimGeo__drawer__listCardStatus", [status]),
        metadatas
      );
      infoStatus.textContent = states[status]
  }

  if (node.shortDescription) {
    const infoDescription = L.DomUtil.create(
      "div",
      info
    );
    infoDescription.textContent =
      node.shortDescription[locale] || node.shortDescription[defaultLocale];
  }
  if (hasImage) {
    // const image = L.DomUtil.create("img", "decidimGeo__drawer__listCardImg", listCard);
    // image.src = node.imageUrl;
  }

  return listCard;
};

export default proposals;
