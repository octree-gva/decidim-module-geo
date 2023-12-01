import MenuItemStore from "../models/menuItemStore";
import {createDomElement} from './createDomElement'
import i18n from "./i18n"


const createNodeMenuItem = ({ node, onClick }) => {
  const listCard = createDomElement(
    "li",
    "decidimGeo__sidebar__listCard"
  );
  listCard.onclick = onClick;
  MenuItemStore.addMenuItem(listCard)

  const info = createDomElement(
    "div",
    "decidimGeo__sidebar__listCardInfo",
    listCard
  );

  const infoType = createDomElement(
    "div",
    "decidimGeo__sidebar__listCardType",
    info
  );
  infoType.textContent += i18n[node.type];

  const infoTitle = createDomElement(
    "div",
    "decidimGeo__sidebar__listCardTitle",
    info
  );
  infoTitle.textContent += node.title.translation;

  if (node.shortDescription) {
    const infoDescription = createDomElement(
      "div",
      "decidimGeo__sidebar__listCardDescription",
      info
    );
    infoDescription.textContent +=
      node.shortDescription.translation.replace(/<[^>]+>/g, "");
  }

  if (node.bannerImage) {
    const image = createDomElement(
      "img",
      "decidimGeo__sidebar__listCardImg",
      listCard
    );
    image.src = node.bannerImage;
  }
  return listCard;
};

export default createNodeMenuItem;
