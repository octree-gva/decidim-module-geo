const createMarker = ({ title, description, location, image, href }) => {
  return new L.circleMarker(location, {
    radius: 6,
    fillColor: "#000000",
    fillOpacity: 1,
    color: "#cccccc",
    opacity: 1,
    weight: 5,
  }).bindPopup(
    `<h6>${title}</h6> <p>${description}</p> <img src="${image}" width=40 height=40 /><a href="${href}">View</a>`
  );
};

export default createMarker;
