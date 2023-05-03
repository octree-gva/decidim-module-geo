const polylabel = require("polylabel");

const createGeoScopeLayer = ({ geoScope, map }) => {
  const layer = L.geoJSON(geoScope.geom, {
    style: feature => {
      return {
        fillColor: "#cccccc",
        color: "#999999",
        lineJoin: "miter",
        dashArray: "5, 10",
        dashOffset: "5",
      };
    },
  }).addTo(map);

  const label = String(geoScope.name.translation);
  if (geoScope.geom.type === "MultiPolygon") {
    let centroid = polylabel(geoScope.geom.coordinates[0], 1.0);
    const circle = new L.circleMarker([centroid[1], centroid[0]], {
      radius: 6,
      fillColor: "#000000",
      fillOpacity: 1,
      color: "#cccccc",
      opacity: 1,
      weight: 5,
    });

    return circle
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
