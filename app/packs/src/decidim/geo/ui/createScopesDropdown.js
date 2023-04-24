const { getGeoScopes } = require("../api");
const polylabel = require("polylabel");

async function createScopesDropdown(map) {
  const scopes = await getGeoScopes();

  const CustomLayerControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    state: {
      parentScope: null,
      isListOpened: false,
    },

    title: null,
    list: null,

    setState: function (stateUpdate) {
      this.state = { ...this.state, ...stateUpdate };
      return this.onStateUpdate();
    },

    onStateUpdate: function () {
      this.state.isListOpened
        ? (this.list.className = "decidimGeo__scopesDropdown__list")
        : (this.list.className =
            "decidimGeo__scopesDropdown__list decidimGeo__scopesDropdown__list--closed");
    },

    onAdd: function (map) {
      const menu = L.DomUtil.create("div", "decidimGeo__scopesDropdown");
      menu.ondblclick = function (event) {
        event.stopPropagation();
        return false;
      };

      this.title = L.DomUtil.create("h5", "", menu);

      this.title.textContent += "All scopes";
      this.title.onclick = event => {
        event.stopPropagation();
        this.setState({ isListOpened: !this.state.isListOpened });
      };

      this.list = L.DomUtil.create(
        "ul",
        "decidimGeo__scopesDropdown__list decidimGeo__scopesDropdown__list--closed",
        menu
      );

      scopes.forEach(scope => {
        const menuItem = L.DomUtil.create("li", "", this.list);

        const scopeName = scope.name.translation;
        menuItem.textContent += scopeName;

        L.geoJSON(scope.geom, {
          style: feature => {
            return {
              fillColor: "#cccccc",
              color: "#999999",
              lineJoin: "miter",
              dashArray: "5, 10",
              dashOffset: "5",
            };
          },
        }).addTo(map);

        const label = String(scopeName);
        if (scope.type === "Polygon") {
          const centroid = polylabel(scope.geom.coordinates, 1.0);
          const circle = new L.circleMarker([centroid[1], centroid[0]], {
            radius: 6,
            fillColor: "#000000",
            fillOpacity: 1,
            color: "#cccccc",
            opacity: 1,
            weight: 5,
          });
          return circle
            .bindTooltip(label, {
              permanent: true,
              opacity: 1,
              permanent: true,
              direction: "top",
              className: "decidimGeo__scope__tooltip",
            })
            .openTooltip()
            .addTo(map);
        }
      });

      return menu;
    },
  });

  const control = new CustomLayerControl();
  return map.addControl(control);
}

export default createScopesDropdown;
