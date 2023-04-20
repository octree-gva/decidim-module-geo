const {
  createLayerGroup,
  createMarker,
  createControlInputElement,
  createCustomLayerControl,
} = require("./index.js");
const {
  displayNestedLayers,
} = require("../actions");

function createNestedControls(
  map,
  {
    label,
    data,
    getSubGroupName = ({ name }) => name,
    getNodes = entity => [entity],
    formatMarkerDataReducers: {
      title: titleReducer = ({ title }) => title,
      description: descriptionReducer = ({ description }) => description,
      location: locationReducer = ({ location }) => location,
      image: imageReducer = ({ image }) => image,
      href: hrefReducer = ({ href }) => href,
    },
  }
) {
  var subGroupsMarkers = {};
  createLayerGroup(data, entity => {
    var subGroup = getSubGroupName(entity);

    var markers = [];
    var nodes = getNodes(entity);

    nodes.forEach(inode => {
      var title = titleReducer({ ...inode, entity });
      var description = descriptionReducer({ ...inode, entity });
      var location = locationReducer({ ...inode, entity });
      var image = imageReducer({ ...inode, entity });
      var href = hrefReducer({ ...inode, entity });
      if (location) {
        var marker = createMarker({
          title,
          description,
          location,
          image,
          href,
        });

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

  const childControls = Object.keys(subGroupsMarkers).map(group => {
    return createCustomLayerControl(map, {
      group: label,
      label: group,
      layer: L.layerGroup(subGroupsMarkers[group]),
    });
  });

  var ParentControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    onAdd: function (map) {
      return createControlInputElement({
        label,
        changeEventHandler: event => {
          childControls.forEach(control => {
            displayNestedLayers(control._container, event.target.checked);
          });
        },
      });
    },
  });

  map.addControl(new ParentControl());
  childControls.forEach(control => map.addControl(control));
}

export default createNestedControls;
