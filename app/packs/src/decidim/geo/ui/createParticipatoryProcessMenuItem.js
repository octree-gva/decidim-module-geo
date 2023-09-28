const createParticipatoryProcessMenuItem = ({
  participatoryProcess,
  onClick,
}) => {
  const listCard = L.DomUtil.create(
    "li",
    "decidimGeo__scopesDropdown__listCard"
  );
  listCard.onclick = onClick;

  const image = L.DomUtil.create(
    "img",
    "decidimGeo__scopesDropdown__listCardImg",
    listCard
  );
  image.src = participatoryProcess.bannerImage;

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
  infoType.textContent += "process";

  const infoTitle = L.DomUtil.create(
    "div",
    "decidimGeo__scopesDropdown__listCardTitle",
    info
  );
  infoTitle.textContent += participatoryProcess.title.translation;

  const infoDescription = L.DomUtil.create(
    "div",
    "decidimGeo__scopesDropdown__listCardDescription",
    info
  );
  infoDescription.textContent +=
    participatoryProcess.shortDescription.translation.replace(/<[^>]+>/g, "");

  return listCard;
};

export default createParticipatoryProcessMenuItem;
