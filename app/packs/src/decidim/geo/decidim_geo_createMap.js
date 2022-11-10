import * as L from "leaflet";

function createMarker({ description, location, href }) {
  return L.marker(location).bindPopup(
    `<h1>${description}</h1> <a href="${href}">View</a>`
  );
}

function createPolygon(entity) {
  return L.polygon(entity.polygon);
}

function getParticipatoryProcessesNodes(participatoryProcess) {
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

function createLayerGroup(collection, createEntityMarkers) {
  var layerGroup = [];
  collection.forEach(entity => {
    var markers = createEntityMarkers(entity);
    if (markers.length > 0) {
      markers.forEach(marker => layerGroup.push(marker));
    }
  });
  return L.layerGroup(layerGroup);
}

async function getCollection(url) {
  var collection = await window
    .fetch(url)
    .then(response => response.json())
    .catch(alert);

  if (collection) {
    return collection;
  }
  return [];
}

async function getDecidimData(query) {
  var collection = await window
    .fetch("https://participer.lausanne.ch/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    })
    .then(response => response.json())
    .catch(alert);

  if (collection) {
    return collection;
  }
  return [];
}

function createParentControlInputelement({ label, changeEventHandler }) {
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

// createCollectionNestedControls

function createCollectionNestedControls(
  map,
  { label, collection, subGroupsMatchers = {} }
) {
  var subGroups = Object.keys(subGroupsMatchers);

  var subGroupsMarkers = {};
  var allLayerGroup = createLayerGroup(collection, entity => {
    var marker = createMarker(entity);

    function matchSublayer(i = 0) {
      if (i >= subGroups.length) {
        return subGroupsMarkers[subGroup];
      }

      var subGroup = subGroups[i];
      if (subGroupsMatchers[subGroup](entity)) {
        if (subGroupsMarkers[subGroup]) {
          subGroupsMarkers[subGroup].push(marker);
        } else {
          subGroupsMarkers[subGroup] = [marker];
        }
        return subGroupsMarkers[subGroup];
      }

      return matchSublayer(++i);
    }

    return matchSublayer();
  });

  var subLayerGroups = {};
  subGroups.forEach(group => {
    subLayerGroups[group] = L.layerGroup(subGroupsMarkers[group]);
  });
  var subControls = L.control.layers({}, subLayerGroups, {
    collapsed: false,
    position: "topleft",
  });

  var NestedControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    onAdd: function (map) {
      return createParentControlInputelement({
        label,
        changeEventHandler: event => {
          var layers = Object.values(allLayerGroup._layers);
          subControls._layerControlInputs.forEach(subInput => {
            if (subInput.checked != event.target.checked) {
              //this need to be a click event in order to trigger leaflet _onInputClick method
              // and keep the layer aligned with the corresponding input state
              subInput.dispatchEvent(
                new MouseEvent("click", {
                  view: window,
                  bubbles: false,
                  cancelable: false,
                })
              );
            }
          });
          for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (event.target.checked) {
              map.addLayer(layer);
            } else if (map.hasLayer(layer)) {
              map.removeLayer(layer);
            }
          }
        },
      });
    },
  });

  map.addControl(new NestedControl());
  subControls.addTo(map);
}

// createCollectionControls

function createCollectionControl(map, { label, layerGroup }) {
  var CollectionCustomControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    onAdd: function (map) {
      return createParentControlInputelement({
        label,
        changeEventHandler: event => {
          var layers = Object.values(layerGroup._layers);
          for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (event.target.checked) {
              map.addLayer(layer);
            } else if (map.hasLayer(layer)) {
              map.removeLayer(layer);
            }
          }
        },
      });
    },
  });

  map.addControl(new CollectionCustomControl());
}


// createNestedControls

function createNestedControls(
  map,
  {
    label,
    data,
    getSubGroupName = ({ name }) => name,
    getNodes = entity => [entity],
    formatMarkerDataReducers: {
      description: descriptionReducer = ({ description }) => description,
      location: locationReducer = ({ location }) => location,
      href: hrefReducer = ({ href }) => href,
    },
  }
) {
  var subGroupsMarkers = {};

  var allLayerGroup = createLayerGroup(data, entity => {
    //format api data for markers
    var subGroup = getSubGroupName(entity);

    var markers = [];
    var nodes = getNodes(entity);

    nodes.forEach(inode => {
      var description = descriptionReducer(inode);
      var location = locationReducer(inode);
      var href = hrefReducer(inode);
      if (location) {
        var marker = createMarker({ description, location, href });

        if (subGroupsMarkers[subGroup] && marker) {
          subGroupsMarkers[subGroup].push(marker);
        } else {
          subGroupsMarkers[subGroup] = [marker];
        }

        markers.push(marker);
      }
    });

    return markers;
  });

  var subLayerGroups = {};
  Object.keys(subGroupsMarkers).forEach(group => {
    subLayerGroups[group] = L.layerGroup(subGroupsMarkers[group]);
  });
  var subControls = L.control.layers({}, subLayerGroups, {
    collapsed: false,
    position: "topleft",
  });

  var NestedControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    onAdd: function (map) {
      return createParentControlInputelement({
        label,
        changeEventHandler: event => {
          var layers = Object.values(allLayerGroup._layers);
          subControls._layerControlInputs.forEach(subInput => {
            if (subInput.checked != event.target.checked) {
              //this need to be a click event in order to trigger leaflet _onInputClick method
              // and keep the layer aligned with the corresponding input state
              subInput.dispatchEvent(
                new MouseEvent("click", {
                  view: window,
                  bubbles: false,
                  cancelable: false,
                })
              );
            }
          });
          for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            if (event.target.checked) {
              map.addLayer(layer);
            } else if (map.hasLayer(layer)) {
              map.removeLayer(layer);
            }
          }
        },
      });
    },
  });

  map.addControl(new NestedControl());
  subControls.addTo(map);
}


// queries

var participatoryProcessesQuery = `{  
  participatoryProcesses {
    id
    title {
      translation(locale: "fr")
    }
    components(filter: {type: "Meetings"}) {
      id
      __typename
      ... on Meetings {
        meetings {
          nodes {
            description {
              translation(locale: "fr")
            }
            coordinates {
              latitude
              longitude
            }
          }
        }
      }
    }
  }
}`

// createMap

async function createMap() {
  var map = L.map("map", { center: [46.521297, 6.632541], zoom: 14 });
  map.zoomControl.setPosition("topright");

  var osm = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
  ).addTo(map);

  var {
    data: { participatoryProcesses },
  } = await getDecidimData(participatoryProcessesQuery);
  createNestedControls(map, {
    label: "processes",
    data: participatoryProcesses,
    getSubGroupName: ({ title: { translation } }) => translation,
    getNodes: getParticipatoryProcessesNodes,
    formatMarkerDataReducers: {
      description: ({description: {translation}}) => translation,
      location: ({ coordinates: { latitude, longitude } }) => {
        if (latitude && longitude) return [latitude, longitude];
      },
      href: () => "/test",
    },
  });
}

createMap();
