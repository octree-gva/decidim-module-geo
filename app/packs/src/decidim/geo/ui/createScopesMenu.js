import GeoScope from "../models/geoScope";
const { default: GeoDatasourceNode } = require("../models/geoDatasourceNode");
import createGeoScopeMenuItem from './createGeoScopeMenuItem'
import createClasses from "./createClasses";
import i18n from "./i18n";

const { getGeoScopes, getGeoDatasource } = require("../api");


async function createScopesDropdown(map, config) {
  const scopes = await getGeoScopes({ variables: { id: config.highlighted_scopes } });
  const eventListeners = {}
  /**
   * Trigger an event
   * @param {string} eventName 
   * @param {Record<string, unknown> | undefined} payload 
   */
  const triggerEvent = (eventName, payload) => {
    const listeners = eventListeners[eventName] || []
    listeners.forEach((listener) => {
      listener(payload);
    })
  }
  const CustomLayerControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    //Model
    isOpen: false,
    isLoading: true,
    scopes: scopes,
    activeScope: null,
    orphanNodes: [],

    //View
    map,
    mapConfig: config,
    menu: null,
    heading: null,
    title: null,
    resetBtn: null,
    dropDownOptions: null,
    orphanLayer:  L.layerGroup(),
    geoScopes: [],

    //Controlers
    toggleShow() {
      this.isOpen = !this.isOpen
    },

    isEmpty() {
      return this.geoScopes.length === 0;
    },

    initMenuElements() {
      this.heading = L.DomUtil.create(
        "div",
        createClasses(
          "decidimGeo__scopesDropdown__heading",
          [!this.isOpen && "closed"]
        ),
        this.menu
      );

      this.title = L.DomUtil.create(
        "h6",
        createClasses(
          "decidimGeo__scopesDropdown__title",
          [!this.isOpen && "closed", this.isLoading && "loading"]
        ),
        this.heading
      );
      this.title.onclick = () => {
        this.toggleShow();
        this.repaint();
      };

      this.resetBtn = L.DomUtil.create(
        "button",
        createClasses("decidimGeo__scopesDropdown__reset", 
        ["hidden"]),
        this.heading
      );
      this.resetBtn.textContent = "reset";
      this.resetBtn.onclick = () => {
        this.reset();
        triggerEvent("selectAllScopes", null)
      }

      this.dropDownOptions = L.DomUtil.create(
        "ul",
        createClasses(
          "decidimGeo__scopesDropdown__list",
          [!this.isOpen && "closed", this.isEmpty() && "empty"]
        ),
        this.menu
      );
    },
    repaintHeading() {
      // Dropdown heading text
      if (this.activeScope === null) {
        // all scopes
        this.title.textContent = i18n["scopes.all"];
      } else {
        // specific scope
        this.title.textContent = this.activeScope.name
      }
      this.resetBtn.className = createClasses("decidimGeo__scopesDropdown__reset", [this.activeScope === null && "hidden"])
    },
    repaintOptions() {
      // Dropdown options
      L.DomUtil.empty(this.dropDownOptions)
      if(this.activeScope) {
        // Add a "All Scope" menu item
        const resetItem = createGeoScopeMenuItem({
          label: i18n["scopes.all"],
          onClick: () => {
            if(this.activeScope) this.activeScope.unSelect();
            this.reset();
          },
        })
        this.dropDownOptions.appendChild(resetItem)
      }
      // Add all the other scopes
      this.geoScopes.filter((geoScope) => {
        return geoScope !== this.activeScope
      }).forEach(geoScope => {
        this.dropDownOptions.appendChild(geoScope.menuItem);
      });
    },
    repaintOpenClose() {
      // Dropdown backdrop open/close
      this.title.className = createClasses(
        "decidimGeo__scopesDropdown__title",
        [!this.isOpen && "closed", this.isEmpty() && "empty"]
      );
      this.dropDownOptions.className = createClasses(
        "decidimGeo__scopesDropdown__list",
        [!this.isOpen && "closed", this.isEmpty() && "empty"]
      );
    },
    repaint() {
      this.repaintHeading()
      this.repaintOptions();
      this.repaintOpenClose();
    },
    async prepareGeoScopes() {
      const controller = this;
      return (await Promise.all(scopes.map(async scope => {
        const geoScope = new GeoScope({
          geoScope: scope,
          mapConfig: this.mapConfig,
          map,
          menuElements: {
            heading: controller.heading,
            title: controller.title,
            list: controller.dropDownOptions,
            resetBtn: controller.resetBtn,
          },
          selectScope: (scope, source) => {
            if (controller.activeScope === scope) return;
            controller.activeScope = scope;
            if(source === "marker")
              controller.toggleShow()
            else
              controller.isOpen = false;
            
            controller.repaint();
            triggerEvent("selectScope", scope);
          },
          selectAllScopes: () => {
            controller.reset();
            triggerEvent("selectAllScopes", null)
          }
        });
        await geoScope.init();
        return geoScope.isEmpty() ? undefined : geoScope;
      }))).filter(Boolean);
    },
    async fetchAndAddOrphanNodes () {
      const response = await getGeoDatasource({
        variables: { filters: [{ notScopeFilter: { scopesId: scopes.map(({id}) => id)} }], locale: this.mapConfig.locale },
      });
      response.nodes.map(node => {
        return (new GeoDatasourceNode({
          node,
          map: this.map,
          mapConfig: this.mapConfig,
          onClick: this.reset.bind(this)
        })).init();
      }).filter(Boolean).forEach(({marker}) => {
        marker.addTo(this.orphanLayer)
      })
    },
    onAdd(map) {
      this.menu = L.DomUtil.create("div", "decidimGeo__scopesDropdown");
      L.DomEvent.disableClickPropagation(this.menu);
      L.DomEvent.disableScrollPropagation(this.menu);
      this.initMenuElements();
<<<<<<< HEAD
      this.isLoading= true
      this.prepareGeoScopes().then(async (geoScopes) => {
        this.geoScopes = geoScopes;
        geoScopes.forEach(geoScope => this.dropDownOptions.appendChild(geoScope.menuItem));
        if(this.mapConfig.highlighted_scopes.length > 0) {
          const match = geoScopes.find(({data}) => this.mapConfig.highlighted_scopes.some(id => `${id}` === `${data.id}`))
          if(match){
            match.select("layer");
          }
        else
          console.error("no scope id" + this.mapConfig.highlighted_scopes.join(", ") + " found")
        }
        await this.fetchAndAddOrphanNodes();
      }).finally(() => {
        this.isLoading = false;
        this.repaint();
        if(this.mapConfig.highlighted_scopes.length === 0) {
          triggerEvent("selectAllScopes", null)
        }
      })
      this.repaint()
=======

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
        console.log('geoScope')
        console.log(geoScope)
        this.menu.appendChild(geoScope.menuItem);
        this.scopes.push(geoScope);
      });

>>>>>>> 721711832d408381e39fae609aa19fb3de717289
      return this.menu;
    },
    reset() {
      this.activeScope = null;
      this.isOpen = false;
      this.geoScopes.forEach(geoScope => geoScope.unSelect());
      triggerEvent("selectAllScopes", null)
      this.repaint();
    },
  });

  const control = new CustomLayerControl();
  map.addControl(control);
  control.orphanLayer.addTo(map);

  return {
    /**
     * Listen on an event
     * @param {"selectScope" | "selectAllScopes"} eventName 
     * @param {(payload: Record<string, unknown>|undefined) => void} listener 
     */
    on: (eventName, listener) => {
      if (!eventListeners[eventName])
        eventListeners[eventName] = []
      eventListeners[eventName].push(listener);
    },
    /**
     * Stop listening an event. If no listener are given, stop listening at all to the menu.
     * @param {"selectScope" | "selectAllScopes"} eventName 
     * @param {undefined | (payload: Record<string, unknown>|undefined) => void} listener 
     */
    off: (eventName, listener = undefined) => {
      if (!eventListeners[eventName])
        return;
      if (listener)
        eventListeners[eventName] = eventListeners[eventName].filter((l) => l !== listener)
      else
        delete eventListeners[eventName];
    }
  }
}

export default createScopesDropdown;
