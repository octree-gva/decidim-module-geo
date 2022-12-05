const { createControlInputElement } = require("./decidim_geo_utils");

function createCustomLayerControl(map, { label, layer, level = "parent" }) {
  const CustomLayerControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    onAdd: function (map) {
      return createControlInputElement({
        level,
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
  if (level === "parent") {
    return map.addControl(control);
  }
  return control;
}

export default createCustomLayerControl;
