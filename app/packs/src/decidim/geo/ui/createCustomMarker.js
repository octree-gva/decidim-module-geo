const createCustomMarker = (location) => {
  return new L.circleMarker(location, {
    radius: 6,
    fillColor: "#ffffff",
    fillOpacity: 1,
    color: "#404040",
    opacity: 1,
    weight: 5
  });
};

export default createCustomMarker;
