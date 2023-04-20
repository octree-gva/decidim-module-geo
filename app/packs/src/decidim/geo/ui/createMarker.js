const createMarker = ({ title, description, location, image, href }) => {
  return L.marker(location).bindPopup(
    `<h6>${title}</h6> <p>${description}</p> <img src="${image}" width=40 height=40 /><a href="${href}">View</a>`
  );
};

export default createMarker;
