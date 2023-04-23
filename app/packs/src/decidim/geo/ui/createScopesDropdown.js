const { getGeoScopes } = require("../api");

async function createScopesDropdown(map) {
  const scopes = await getGeoScopes();

  const CustomLayerControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    onAdd: function (map) {
      const menu = L.DomUtil.create("div", "decidimGeo__scopesDropdown");

      const title = L.DomUtil.create("h5", "", menu);
      title.textContent += "All scopes";

      const list = L.DomUtil.create("ul", "", menu);

      scopes.forEach(scope => {
        console.log(scope);
        const menuItem = L.DomUtil.create("li", `${scope.name.translation}`, list);
        menuItem.textContent += scope.name.translation;

      });

      return menu;
    },
  });

  const control = new CustomLayerControl();
  return map.addControl(control);
}

export default createScopesDropdown;
