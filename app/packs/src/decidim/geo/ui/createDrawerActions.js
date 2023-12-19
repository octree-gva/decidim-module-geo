import createGeoScopeMenuItem from "./createGeoScopeMenuItem";
import createClasses from "./createClasses";
import geoStore from "../models/geoStore";
import pointStore from "../models/pointStore";
import configStore from "../models/configStore";
import createFilterDropdown from "./createFilterDropdown";
import scopeDropdownStore from "../models/scopeDropdownStore";

async function createScopesDropdown() {
  const CustomLayerControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft"
    },

    //View
    menu: null,
    heading: null,
    filterDropdown: null,
    title: null,
    dropDownOptions: null,

    //Controlers
    toggleOpen() {
      scopeDropdownStore.getState().toggleOpen();
    },

    isEmpty() {
      const { scopes } = pointStore.getState();
      return scopes.length === 0;
    },
    activeScope() {
      return geoStore.getState().selectedScope;
    },
    initMenuElements() {
      const { isLoading } = pointStore.getState();
      const { isOpen } = scopeDropdownStore.getState();
      this.heading = L.DomUtil.create(
        "div",
        createClasses("decidimGeo__scopesDropdown__heading", [!isOpen && "closed"]),
        this.menu
      );

      this.title = L.DomUtil.create(
        "h6",
        createClasses("decidimGeo__scopesDropdown__title", [
          !isOpen && "closed",
          isLoading && "loading"
        ]),
        this.heading
      );
      this.title.onclick = () => {
        this.toggleOpen();
        this.repaint();
      };
      this.filterDropdown = createFilterDropdown(this.heading, this.menu);
      this.dropDownOptions = L.DomUtil.create(
        "ul",
        createClasses("decidimGeo__scopesDropdown__list", [
          !isOpen && "closed",
          this.isEmpty() && "empty"
        ]),
        this.menu
      );

      this.repaint();
    },
    repaintHeading() {
      const { i18n } = configStore.getState();
      const { selectedPoint } = geoStore.getState();
      if (selectedPoint) {
        this.title.textContent = "Back";
        this.title.onclick = () => {
          geoStore.getState().goBack();
        };
        return;
      } else {
        this.title.onclick = () => {
          this.toggleOpen();
          this.repaint();
        };
      }
      // Dropdown heading text
      if (this.activeScope()) {
        // specific scope
        this.title.textContent = this.activeScope().name;
      } else {
        // all scopes
        this.title.textContent = i18n["decidim_geo.scopes.all"];
      }
    },
    repaintOptions() {
      const { i18n } = configStore.getState();
      const { scopes } = pointStore.getState();
      // Dropdown options
      L.DomUtil.empty(this.dropDownOptions);
      if (this.activeScope()) {
        // Add a "All Scope" menu item
        const resetItem = createGeoScopeMenuItem({
          label: i18n["decidim_geo.scopes.all"],
          onClick: () => {
            geoStore.getState().selectScope(undefined);
          }
        });
        this.dropDownOptions.appendChild(resetItem);
      }
      // Add all the other scopes
      scopes.forEach((geoScope) => {
        if (geoScope !== this.activeScope() && !geoScope.isEmpty())
          this.dropDownOptions.appendChild(geoScope.menuItem);
      });
    },
    repaintOpenClose() {
      const { selectedPoint } = geoStore.getState();
      const { isOpen } = scopeDropdownStore.getState();

      // Dropdown backdrop open/close
      this.title.className = createClasses("decidimGeo__scopesDropdown__title", [
        !isOpen && "closed",
        this.isEmpty() && "empty",
        selectedPoint && "button"
      ]);
      this.dropDownOptions.className = createClasses("decidimGeo__scopesDropdown__list", [
        !isOpen && "closed",
        this.isEmpty() && "empty",
        selectedPoint && "hidden"
      ]);
    },
    repaint() {
      this.repaintHeading();
      this.repaintOptions();
      this.repaintOpenClose();
    },
    onAdd(map) {
      this.menu = L.DomUtil.create("div", "decidimGeo__scopesDropdown");
      L.DomEvent.disableClickPropagation(this.menu);
      L.DomEvent.disableScrollPropagation(this.menu);
      const repaint = this.repaint.bind(this);
      // We we change the available scopes, repaint.
      geoStore.subscribe(
        (state) => [state.selectedScope],
        ([_geoScope], [prevGeoScope]) => {
          if (prevGeoScope) {
            prevGeoScope.repaint();
          }
          repaint();
        }
      );
      pointStore.subscribe(
        (state) => [state.scopes, state.isLoading],
        ([scopes, isLoading]) => {
          if (!scopes || scopes.length == 0 || isLoading) return;
          repaint();
        }
      );
      this.initMenuElements();
      this.repaint(); // first repaint
      scopeDropdownStore.subscribe(
        (state) => [state.isOpen],
        ([isOpen]) => {
          this.repaint();
        }
      );
      return this.menu;
    },
    reset() {
      scopeDropdownStore.getState().close();
    }
  });

  const control = new CustomLayerControl();
  const { map } = configStore.getState();
  map.addControl(control);
}

export default createScopesDropdown;
