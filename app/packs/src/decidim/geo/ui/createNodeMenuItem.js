import MenuItemStore from "../models/menuItemStore";
import i18n from "./i18n"

const createDom = (tag, classes, container = undefined) => L.DomUtil.create(
  tag,
  classes,
  container
);
const createNodeMenuItem = ({ node, onClick }) => {
  const listCard = createDom(
    "li",
    "decidimGeo__sidebar__listCard"
  );
  listCard.onclick = onClick;
  MenuItemStore.addMenuItem(listCard)

  const info = createDom(
    "div",
    "decidimGeo__sidebar__listCardInfo",
    listCard
  );

  const infoType = createDom(
    "div",
    "decidimGeo__sidebar__listCardType",
    info
  );
  infoType.textContent += i18n[node.type];

  const infoTitle = createDom(
    "div",
    "decidimGeo__sidebar__listCardTitle",
    info
  );
  infoTitle.textContent += node.title.translation;

  if (node.shortDescription) {
    const infoDescription = createDom(
      "div",
      "decidimGeo__sidebar__listCardDescription",
      info
    );
    infoDescription.textContent +=
      node.shortDescription.translation.replace(/<[^>]+>/g, "");
  }

  if (node.bannerImage) {
    const image = createDom(
      "img",
      "decidimGeo__sidebar__listCardImg",
      listCard
    );
    image.src = node.bannerImage;
  }
  return listCard;
};

export default createNodeMenuItem;
