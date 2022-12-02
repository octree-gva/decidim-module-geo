export function createMarker({ description, location, href }) {
  return L.marker(location).bindPopup(
    `<h1>${description}</h1> <a href="${href}">View</a>`
  );
}

export function getParticipatoryProcessesNodes(participatoryProcess) {
  var components = participatoryProcess.components;
  if (components && components.length > 0) {
    var meetingsComponent = components.find(
      ({ meetings }) => meetings && meetings.nodes.length > 0
    );

    if (meetingsComponent) {
      return meetingsComponent.meetings.nodes;
    }
  }
  return [];
}

export function createLayerGroup(collection, createEntityMarkers) {
  var layerGroup = [];
  collection.forEach(entity => {
    var markers = createEntityMarkers(entity);
    if (markers.length > 0) {
      markers.forEach(marker => layerGroup.push(marker));
    }
  });
  return L.layerGroup(layerGroup);
}

export async function getDecidimData(query) {
  var collection = await window
    .fetch("http://localhost:3000/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    })
    .then(async response => {
      const res = await response.json();
      return res;
    })
    .catch(alert);

  if (collection) {
    return collection;
  }
  return [];
}

export function createParentControlInputelement({ label, changeEventHandler }) {
  var item = L.DomUtil.create("label");

  var input = L.DomUtil.create("input");
  input.type = "checkbox";
  input.checked = false;
  item.appendChild(input);

  var labelElement = L.DomUtil.create("span");
  labelElement.textContent += " " + label;
  item.appendChild(labelElement);

  var container = L.DomUtil.create("div", "decidimGeo__customControl__parent");
  container.appendChild(item);

  L.DomEvent.disableClickPropagation(input);
  input.addEventListener("change", changeEventHandler);
  return container;
}
