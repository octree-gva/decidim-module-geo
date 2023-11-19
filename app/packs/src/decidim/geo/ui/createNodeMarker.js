import { createCustomMarker } from ".";

const createNodeMarker = (node) => {
  const title = node.title.translation;
  const shortDescription = node.shortDescription?.translation;
  const description = node.description.translation;
  const location = [node.coordinates.latitude, node.coordinates.longitude];
  const customNodeMarker = createCustomMarker(location)
  customNodeMarker.bindPopup(
    `<div class="decidimGeo__popup__container">
      <div class="decidimGeo__popup__content">
        <div class="card__header">
            <div class="card__title">
              ${title}
            </div>
        </div>
        <div class="card__text">
          <div class="card__text--paragraph">
            <div class="decidimGeo__paragraph__overflow">${
              shortDescription || description
            }</div>
          </div>
        </div>
      </div>
    </div>`
  );
  return customNodeMarker
};

export default createNodeMarker;
