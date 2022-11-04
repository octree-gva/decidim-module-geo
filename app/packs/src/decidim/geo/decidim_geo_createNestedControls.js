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
