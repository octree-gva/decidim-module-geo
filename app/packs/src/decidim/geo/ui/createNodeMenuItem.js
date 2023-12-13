import configStore from "../models/configStore";
import { createDomElement } from "./createDomElement";
import _ from 'lodash'

const createNodeMenuItem = ({ node, onClick }) => {
  const { i18n } = configStore.getState();
  const listCard = createDomElement("li", "decidimGeo__drawer__listCard");
  listCard.onclick = onClick;

  const info = createDomElement("div", "decidimGeo__drawer__listCardInfo", listCard);

  const infoType = createDomElement("div", "decidimGeo__drawer__listCardType", info);
  infoType.textContent += i18n[node.type];

  const infoTitle = createDomElement("div", "decidimGeo__drawer__listCardTitle", info);
  infoTitle.textContent += node.title.translation;

  if (node.shortDescription) {
    const infoDescription = createDomElement(
      "div",
      "decidimGeo__drawer__listCardDescription",
      info
    );
    infoDescription.textContent += node.shortDescription.translation.replace(
      /<[^>]+>/g,
      ""
    );
  }

  if (!_.isEmpty(node.bannerImage)) {
    const image = createDomElement("img", "decidimGeo__drawer__listCardImg", listCard);
    image.src = node.bannerImage;
  }
  return listCard;
};

export default createNodeMenuItem;
