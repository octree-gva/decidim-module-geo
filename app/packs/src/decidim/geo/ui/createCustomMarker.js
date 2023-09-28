const createCustomMarker = (location) => {
  return new L.circleMarker(location, {
    radius: 6,
    fillColor: "#000000",
    fillOpacity: 1,
    color: "#cccccc",
    opacity: 1,
    weight: 5,
  });
};

export default createCustomMarker;
