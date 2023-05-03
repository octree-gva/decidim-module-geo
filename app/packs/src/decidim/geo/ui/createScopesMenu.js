import GeoScope from "../models/geoScope";

const { getGeoScopes } = require("../api");

const createClasses = (classname, modifiers) =>
  [classname, ...modifiers.map(modifier => `${classname}--${modifier}`)].join(
    " "
  );

async function createScopesDropdown(map) {
  const scopes = await getGeoScopes();

  const CustomLayerControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    //Model
    isListOpened: false,
    scopes: [],

    //View
    heading: null,
    title: null,
    list: null,

    //Controlers
    switchIsListOpened() {
      this.isListOpened = !this.isListOpened;

      if (this.isListOpened) {
        this.list.className = "decidimGeo__scopesDropdown__list";
        this.title.className = "decidimGeo__scopesDropdown__title";
      } else {
        this.list.className = createClasses(
          "decidimGeo__scopesDropdown__list",
          ["closed"]
        );
        this.title.className = createClasses(
          "decidimGeo__scopesDropdown__title",
          ["closed"]
        );
      }
    },

    onAdd(map) {
      const menu = L.DomUtil.create("div", "decidimGeo__scopesDropdown");
      L.DomEvent.disableClickPropagation(menu);

      this.heading = L.DomUtil.create(
        "div",
        createClasses("decidimGeo__scopesDropdown__heading", ["closed"]),
        menu
      );

      this.title = L.DomUtil.create(
        "h6",
        createClasses("decidimGeo__scopesDropdown__title", ["closed"]),
        this.heading
      );

      this.title.textContent += "All scopes";
      this.title.onclick = event => {
        this.switchIsListOpened();
      };

      this.list = L.DomUtil.create(
        "ul",
        createClasses("decidimGeo__scopesDropdown__list", ["closed"]),
        menu
      );

      scopes.forEach(geoScope => {
        const G = new GeoScope({
          geoScope,
          map,
          menuElements: {
            heading: this.heading,
            title: this.title,
            list: this.list,
          },
        });
        G.init();
        this.scopes.push(geoScope);
      });

      return menu;
    },
  });

  const control = new CustomLayerControl();
  return map.addControl(control);
}

export default createScopesDropdown;
