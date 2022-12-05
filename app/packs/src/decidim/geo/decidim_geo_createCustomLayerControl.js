const { createControlInputElement } = require("./decidim_geo_utils");

function createCustomLayerControl(map, { label, layer, group }) {
  const CustomLayerControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    onAdd: function (map) {
      return createControlInputElement({
        group,
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

  const control = new CustomLayerControl({}, layer);
  if (group) {
    return control;
  } else {
    return map.addControl(control);
  }
}

export default createCustomLayerControl;
