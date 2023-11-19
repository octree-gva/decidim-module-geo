import { createCustomMarker } from ".";

const createGeoScopeLayer = ({ geoScope, map, onClick, centroid }) => {
  console.log('geoScope')

  geoScope.geom = { ...geoScope.geom, properties: {id: geoScope.id, name: geoScope.name.translation}}
  const layer = L.geoJSON(geoScope.geom, {
    style: {
      fillColor: "#cccccc",
      color: "#999999",
      lineJoin: "miter",
      dashArray: "5, 10",
      dashOffset: "5",
    },
  }).addTo(map);

  layer.on("click", onClick);

  const label = String(geoScope.name.translation);
  if (centroid) {
    const circle = createCustomMarker([centroid[1], centroid[0]]);

    circle
      .bindTooltip(label, {
        permanent: true,
        opacity: 1,
        permanent: true,
        direction: "top",
        className: "decidimGeo__scope__tooltip",
      })
      .bindPopup(
              `<div class="decidimGeo__popup__container">
                  <div class="decidimGeo__popup__content">
                    <div class="card__header">
                      <div class="card__title">
                        ${geoScope.name.translation}
                      </div>
                    </div>
                    <div class="card__text">
                      <div class="card__text--paragraph">
                        <div class="decidimGeo__paragraph__overflow">
                        </div>
                      </div>
                    </div>
                  </div>
               </div>`)
      .openTooltip()
      .addTo(map);
  }

  return layer;
};

export default createGeoScopeLayer;
