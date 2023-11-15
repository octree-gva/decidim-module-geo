import { createCustomMarker } from ".";

const applyCustomStyle = (node, mapConfig, customNodeMarker) => {
  if (
    (node.type === "Decidim::Meetings::Meeting" && mapConfig.component === 'meetings') ||
    (node.type === "Decidim::Proposals::Proposal" && mapConfig.component === 'proposals')
  ) {
    customNodeMarker.setStyle({ fillColor: '#2952A370', color: '#2952A370' });
  }
};

const createNodeMarker = (node, mapConfig) => {
  console.log(node)
  const title = node.title.translation;
  const shortDescription = node.shortDescription?.translation;
  const description = node.description.translation;
  const location = [node.coordinates.latitude, node.coordinates.longitude];
  const customNodeMarker = createCustomMarker(location)
  applyCustomStyle(node, mapConfig, customNodeMarker);
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
  </div>
</div>`
  );
  return customNodeMarker
};



export default createNodeMarker;
