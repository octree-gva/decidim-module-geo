import createGeoScopeMenuItem from "./createGeoScopeMenuItem";
import createClasses from "./createClasses";
import geoStore from "../models/geoStore";
import pointStore from "../models/pointStore";
import configStore from "../models/configStore";
import createFilterDropdown from "./createFilterDropdown";
import scopeDropdownStore from "../models/scopeDropdownStore";
import memoryStore from "../models/memoryStore";
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
    scopes() {
      const { scopeForId, scopes } = pointStore.getState();
      const { space_ids } = configStore.getState();
      if (space_ids.length > 0)
        return space_ids.map((id) => scopeForId(id)).filter(Boolean) || [];
      return scopes || [];
    },
    isEmpty() {
      return this.scopes().length === 0;
    },
    hasOneOption() {
      return this.scopes().length === 1;
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
      const scopes = this.scopes();
      if (selectedPoint) {
        this.title.className += " decidimGeo__scopesDropdown__list--select-state";
        this.title.textContent = i18n["decidim_geo.filters.back"];
        this.title.onclick = () => {
          geoStore.getState().goBack();
        };
        return;
      } 
      if (scopes.length < 2) {
        this.title.textContent = i18n["decidim_geo.scopes.dropdown"];
        if(scopes.length === 0)
          this.title.className += " decidimGeo__scopesDropdown__list--disabled";
        else
          this.title.className += " decidimGeo__scopesDropdown__list--alone";
        this.title.onclick = () => false;
        return;
      } else {
        this.title.className += " decidimGeo__scopesDropdown__list--with-options";

        this.title.onclick = () => {
          this.toggleOpen();
          this.repaint();
        };
      }

      // Dropdown heading text
      if (this.activeScope()) {
        // specific scope
        this.title.textContent = this.activeScope().name;
      } else if (scopes.length === 1) {
        this.title.textContent = scopes[0].name;
      } else {
        // all scopes
        this.title.textContent = i18n["decidim_geo.scopes.dropdown"];
      }
    },
    repaintOptions() {
      const { i18n } = configStore.getState();
      const scopes = this.scopes();
      // Dropdown options
      L.DomUtil.empty(this.dropDownOptions);
      if (scopes.length == 1) return;
      if (this.activeScope() && scopes.length > 1) {
        // Add a "All Scope" menu item
        const resetItem = createGeoScopeMenuItem({
          label: i18n["decidim_geo.scopes.all"],
          onClick: () => {
            const { popState } = memoryStore.getState();
            popState();
            this.toggleOpen();
            geoStore.getState().selectScope(undefined);
            geoStore.getState().selectPoint(undefined);
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
        !selectedPoint && this.isEmpty() && "empty",
        selectedPoint && "button",
        !selectedPoint && this.hasOneOption() && "alone",
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
        ([]) => {
          this.repaint();
        }
      );
      return this.menu;
    },
    reset() {
      scopeDropdownStore.getState().close();
    },
    close() {
      scopeDropdownStore.getState().close();
    }
  });

  const control = new CustomLayerControl();
  const { map } = configStore.getState();
  map.addControl(control);
}

export default createScopesDropdown;
