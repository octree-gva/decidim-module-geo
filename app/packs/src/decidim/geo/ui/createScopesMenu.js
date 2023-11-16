import GeoScope from "../models/geoScope";
import i18n from "./i18n";

const { getGeoScopes } = require("../api");

const createClasses = (classname, modifiers) =>
  [classname, ...modifiers.map(modifier => `${classname}--${modifier}`)].join(
    " "
  );

async function createScopesDropdown(map, config) {
  console.log('createScopesDropdown');
  console.log(config);
  //const {scopes: highlighted_scopes = []} = config
  console.log(config.highlighted_scopes);
  // if (!config.highlighted_scopes) return null; // there is no switch to do
  const scopes = await getGeoScopes({variables: {id: config.highlighted_scopes}});

  const CustomLayerControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    //Model
    isListOpened: false,
    scopes: scopes,

    //View
    menu: null,
    heading: null,
    title: null,
    list: null,

    //Controlers
    switchIsListOpened(value) {
      this.isListOpened = value;

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

    initMenuElements() {
      this.heading = L.DomUtil.create(
        "div",
        createClasses(
          "decidimGeo__scopesDropdown__heading",
          this.isListOpened ? [] : ["closed"]
        ),
        this.menu
      );

      this.title = L.DomUtil.create(
        "h6",
        createClasses(
          "decidimGeo__scopesDropdown__title",
          this.isListOpened ? [] : ["closed"]
        ),
        this.heading
      );

      this.title.textContent += i18n["scopes.all"];
      this.title.onclick = () => {
        this.switchIsListOpened(!this.isListOpened);
      };

      this.list = L.DomUtil.create(
        "ul",
        createClasses(
          "decidimGeo__scopesDropdown__list",
          this.isListOpened ? [] : ["closed"]
        ),
        this.menu
      );
    },

    onAdd(map) {
      this.menu = L.DomUtil.create("div", "decidimGeo__scopesDropdown");
      L.DomEvent.disableClickPropagation(this.menu);
      L.DomEvent.disableScrollPropagation(this.menu);
      this.initMenuElements();

      scopes.forEach(async scope => {
        const geoScope = new GeoScope({
          geoScope: scope,
          mapConfig: config,
          map,
          menuElements: {
            heading: this.heading,
            title: this.title,
            list: this.list,
          },
          menuActions: {
            reset: this.reset.bind(this),
            switchIsListOpened: this.switchIsListOpened.bind(this),
          },
        });
        await geoScope.init();
        this.menu.appendChild(geoScope.menuItem);
        this.scopes.push(geoScope);
      });

      return this.menu;
    },

    reset() {
      L.DomUtil.remove(this.heading);
      L.DomUtil.remove(this.list);
      this.initMenuElements();
      this.scopes.forEach(geoScope => {
        geoScope.menuElements = {
          heading: this.heading,
          title: this.title,
          list: this.list,
        };
        //geoScope.unSelect();
        //this.list.appendChild(geoScope.menuItem);
      });
    },
  });

  const control = new CustomLayerControl();
  return map.addControl(control);
}

export default createScopesDropdown;
