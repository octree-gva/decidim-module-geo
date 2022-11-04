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
