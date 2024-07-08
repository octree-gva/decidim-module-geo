const createGeoScopeLayer = ({ geoScope, onClick }) => {
  geoScope.geom = {
    ...geoScope.geom,
    properties: { id: geoScope.id, name: geoScope.name.translation || geoScope.name.defaultTranslation }
  };
  const layer = L.geoJSON(geoScope.geom, {
    style: {
      fillColor: "#cccccc",
      color: "#999999",
      lineJoin: "miter",
      dashArray: "5, 10",
      dashOffset: "5"
    }
  });
  layer.on("click", onClick);

  return layer;
};

export default createGeoScopeLayer;
