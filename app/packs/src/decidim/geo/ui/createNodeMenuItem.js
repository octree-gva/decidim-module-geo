import i18n from "./i18n"

const createNodeMenuItem = ({ node, onClick }) => {
  const listCard = L.DomUtil.create(
    "li",
    "decidimGeo__scopesDropdown__listCard"
  );
  listCard.onclick = onClick;

  if (node.bannerImage) {
    const image = L.DomUtil.create(
      "img",
      "decidimGeo__scopesDropdown__listCardImg",
      listCard
    );
    image.src = node.bannerImage;
  }

  const info = L.DomUtil.create(
    "div",
    "decidimGeo__scopesDropdown__listCardInfo",
    listCard
  );

  const infoType = L.DomUtil.create(
    "div",
    "decidimGeo__scopesDropdown__listCardType",
    info
  );
  infoType.textContent += i18n[node.type];

  const infoTitle = L.DomUtil.create(
    "div",
    "decidimGeo__scopesDropdown__listCardTitle",
    info
  );
  infoTitle.textContent += node.title.translation;

  if (node.shortDescription) {
    const infoDescription = L.DomUtil.create(
      "div",
      "decidimGeo__scopesDropdown__listCardDescription",
      info
    );
    infoDescription.textContent +=
      node.shortDescription.translation.replace(/<[^>]+>/g, "");
  }

  return listCard;
};

export default createNodeMenuItem;
