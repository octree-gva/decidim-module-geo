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
