const createGeoScopeLayer = ({ geoScope, map, onClick }) => {
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

  return layer;
};

export default createGeoScopeLayer;
