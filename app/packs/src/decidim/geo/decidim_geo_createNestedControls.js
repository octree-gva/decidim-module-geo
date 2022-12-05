const {
  createLayerGroup,
  createMarker,
  createControlInputElement,
  displayNestedLayers,
} = require("./decidim_geo_utils");
const {
  default: createCustomLayerControl,
} = require("./decidim_geo_createCustomLayerControl.js");

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
  createLayerGroup(data, entity => {
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
