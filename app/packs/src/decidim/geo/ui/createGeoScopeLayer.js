import { createCustomMarker } from ".";

const createGeoScopeLayer = ({ geoScope, map, onClick, centroid }) => {
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
      .openTooltip()
      .addTo(map);
  }

  return layer;
};

export default createGeoScopeLayer;
