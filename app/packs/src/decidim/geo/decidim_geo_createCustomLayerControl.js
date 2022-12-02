const { createParentControlInputelement } = require("./decidim_geo_utils");

function createCustomLayerControl(map, { label, layer }) {
  var CollectionCustomControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    onAdd: function (map) {
      return createParentControlInputelement({
        label,
        changeEventHandler: event => {
          if (event.target.checked) {
            map.addLayer(layer);
          } else if (map.hasLayer(layer)) {
            map.removeLayer(layer);
          }
        },
      });
    },
  });

  map.addControl(new CollectionCustomControl());
}

export default createCustomLayerControl;
