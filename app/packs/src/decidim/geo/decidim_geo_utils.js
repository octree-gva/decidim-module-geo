export function createMarker({ title, description, location, image, href }) {
  return L.marker(location).bindPopup(
    `<h6>${title}</h6> <p>${description}</p> <img src="${image}" width=40 height=40 /><a href="${href}">View</a>`
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
    .fetch("/api", {
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

const CONTROLLED_INPUT_CLASS = "decidimGeo__customControl__input";

export function createControlInputElement({
  group,
  label,
  changeEventHandler,
}) {
  //prevent leaflet css override
  const control = L.DomUtil.create("div");
  const container = L.DomUtil.create(
    "div",
    `decidimGeo__customControl__${group ? "child" : "parent"}`,
    control
  );
  const item = L.DomUtil.create("label", "", container);

  const input = L.DomUtil.create("input", CONTROLLED_INPUT_CLASS, item);
  input.type = "checkbox";
  input.checked = false;
  L.DomEvent.disableClickPropagation(input);
  input.addEventListener("change", changeEventHandler);

  const labelElement = L.DomUtil.create("span", "", item);
  labelElement.textContent += " " + label;

  return control;
}

export const displayNestedLayers = (leafletContainer, checked) => {
  if (
    leafletContainer.classList.contains(CONTROLLED_INPUT_CLASS) &&
    leafletContainer.checked !== checked
  ) {
    leafletContainer.dispatchEvent(
      new MouseEvent("click", {
        view: window,
        bubbles: false,
        cancelable: false,
      })
    );
    //leafletContainer.checked = checked;
    //This leads layers to unsynchronize with the input state.
    // Bubbling the click seems to ensure leaflet events are correctly triggered.
  }

  if (leafletContainer.children) {
    return [...leafletContainer.children].map(child =>
      displayNestedLayers(child, checked)
    );
  } else {
    return;
  }
};
