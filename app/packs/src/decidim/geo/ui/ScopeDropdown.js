import scopeDropdownItem from "./scopeDropdownItem";
import createClasses from "./createClasses";
import geoStore from "../stores/geoStore";
import pointStore from "../stores/pointStore";
import configStore from "../stores/configStore";
import FilterDropdown from "./FilterDropdown";
import scopeDropdownStore from "../stores/scopeDropdownStore";
import dropdownFilterStore from "../stores/dropdownFilterStore";
import memoryStore from "../stores/memoryStore";
import _ from "lodash";
export default class ScopeDropdown {
  //View
  constructor(parent) {
    this.parent = parent;
    this.menu = null;
    this.heading = null;
    this.toggleDrawer = null;
    this.filterDropdown = null;
    this.title = null;
    this.titleTxt = null;
    this.dropDownOptions = null;
    this.resetBtn = null;
    this.closeOverlay = null;
    this.repaintResetBtn = null;

    // Cache
    this.cachedScopes = null;
    scopeDropdownStore.subscribe(
      (state) => [state.isOpen],
      () => {
        this.repaint();
      }
    );
  }

  //Controlers
  toggleOpen() {
    scopeDropdownStore.getState().toggleOpen();
  }
  scopes() {
    if (this.cachedScopes !== null) return this.cachedScopes;
    const { scopeForId, scopes } = pointStore.getState();
    const { space_ids } = configStore.getState();
    this.cachedScopes = scopes || [];
    if (space_ids.length > 0) {
      this.cachedScopes = space_ids.map((id) => scopeForId(id)).filter(Boolean) || [];
    }
    return this.cachedScopes;
  }
  isEmpty() {
    return this.scopes().length === 0;
  }
  hasOneOption() {
    return this.scopes().length === 1;
  }
  activeScope() {
    return geoStore.getState().selectedScope;
  }
  initMenuElements() {
    const { loading } = pointStore.getState();
    const { isOpen } = scopeDropdownStore.getState();

    this.heading = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__scopesDropdown__heading", [!isOpen && "closed"]),
      this.menu
    );
    const firstRow = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__scopesDropdown__headingRow", ["filters"]),
      this.heading
    );
    const secondRow = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__scopesDropdown__headingRow", ["drawer-toggle"]),
      this.heading
    );
    this.title = L.DomUtil.create(
      "h6",
      createClasses("decidimGeo__scopesDropdown__title", [
        isOpen ? "open" : "closed",
        loading() && "loading",
        this.hasOneOption() && "alone",
        this.isEmpty() && "empty"
      ]),
      firstRow
    );
    this.title.onclick = _.debounce(this.titleClickHandler.bind(this), 400, {
      leading: false
    });
    this.titleTxt = L.DomUtil.create(
      "span",
      "decidimGeo__scopesDropdown__titleTxt",
      this.title
    );
    const titleIcn = L.DomUtil.create(
      "span",
      "decidimGeo__scopesDropdown__titleIcn decidimGeo__scopesDropdown__titleIcn--more",
      this.title
    );
    titleIcn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7 12C7 11.6044 6.8827 11.2178 6.66294 10.8889C6.44318 10.56 6.13082 10.3036 5.76537 10.1522C5.39992 10.0009 4.99778 9.96126 4.60982 10.0384C4.22186 10.1156 3.86549 10.3061 3.58579 10.5858C3.30608 10.8655 3.1156 11.2219 3.03843 11.6098C2.96126 11.9978 3.00087 12.3999 3.15224 12.7654C3.30362 13.1308 3.55996 13.4432 3.88886 13.6629C4.21776 13.8827 4.60444 14 5 14C5.53043 14 6.03914 13.7893 6.41421 13.4142C6.78929 13.0391 7 12.5304 7 12ZM17 12C17 12.3956 17.1173 12.7822 17.3371 13.1111C17.5568 13.44 17.8692 13.6964 18.2346 13.8478C18.6001 13.9991 19.0022 14.0387 19.3902 13.9616C19.7781 13.8844 20.1345 13.6939 20.4142 13.4142C20.6939 13.1345 20.8844 12.7781 20.9616 12.3902C21.0387 12.0022 20.9991 11.6001 20.8478 11.2346C20.6964 10.8692 20.44 10.5568 20.1111 10.3371C19.7822 10.1173 19.3956 10 19 10C18.4696 10 17.9609 10.2107 17.5858 10.5858C17.2107 10.9609 17 11.4696 17 12ZM10 12C10 12.3956 10.1173 12.7822 10.3371 13.1111C10.5568 13.44 10.8692 13.6964 11.2346 13.8478C11.6001 13.9991 12.0022 14.0387 12.3902 13.9616C12.7781 13.8844 13.1345 13.6939 13.4142 13.4142C13.6939 13.1345 13.8844 12.7781 13.9616 12.3902C14.0387 12.0022 13.9991 11.6001 13.8478 11.2346C13.6964 10.8692 13.44 10.5568 13.1111 10.3371C12.7822 10.1173 12.3956 10 12 10C11.4696 10 10.9609 10.2107 10.5858 10.5858C10.2107 10.9609 10 11.4696 10 12Z" fill="currentColor"/>
</svg>`;
    const titleBack = L.DomUtil.create(
      "span",
      "decidimGeo__scopesDropdown__titleIcn decidimGeo__scopesDropdown__titleIcn--back"
    );
    this.title.prepend(titleBack);
    titleBack.innerHTML = `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16.0413 17.1115L11.4613 12.5315L16.0413 7.94149L14.6313 6.53149L8.63135 12.5315L14.6313 18.5315L16.0413 17.1115Z" fill="currentColor"/>
</svg>`;

    this.filterDropdown = new FilterDropdown(firstRow, this.parent);
    this.dropDownOptions = L.DomUtil.create(
      "ul",
      createClasses("decidimGeo__scopesDropdown__list", [
        isOpen ? "open" : "closed",
        this.isEmpty() && "empty"
      ]),
      this.parent
    );

    this.toggleDrawer = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__scopesDropdown__drawerToggle", [
        isOpen ? "open" : "closed"
      ]),
      secondRow
    );
    this.toggleDrawer.innerHTML = `<svg width="29" height="8" viewBox="0 0 29 8" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.519226 1.93712C0.519226 0.960255 1.487 0.278249 2.40695 0.606805L13.8483 4.69299C14.2822 4.84795 14.7563 4.84795 15.1902 4.69299L26.6315 0.606805C27.5515 0.27825 28.5192 0.960255 28.5192 1.93712V1.93712C28.5192 2.53411 28.1439 3.06665 27.5817 3.26744L15.8076 7.47247C14.9745 7.77003 14.064 7.77003 13.2308 7.47247L1.45673 3.26744C0.894517 3.06665 0.519226 2.53411 0.519226 1.93712V1.93712Z" fill="currentColor" />
</svg>
`;
    this.toggleDrawer.onclick = this.toggleDrawerHandler.bind(this);
    this.repaint();
  }
  toggleDrawerHandler() {
    configStore.setState(({ isAsideOpen }) => ({ isAsideOpen: !isAsideOpen }));
  }
  titleClickHandler() {
    this.toggleOpen();
    this.repaint();
  }
  repaintHeading() {
    const { i18n } = configStore.getState();
    const { selectedPoint } = geoStore.getState();

    if (selectedPoint) {
      this.title.className += " decidimGeo__scopesDropdown__list--select-state";
      this.titleTxt.textContent = i18n["decidim_geo.filters.back"];
      this.title.onclick = this.goBackHandler.bind(this);
      return;
    } else {
      this.title.onclick = _.debounce(this.titleClickHandler.bind(this), 400, {
        leading: false
      });
    }
    if (this.isEmpty()) {
      this.title.className += " decidimGeo__scopesDropdown__list--disabled";
      return;
    } else {
      this.title.className += " decidimGeo__scopesDropdown__list--with-options";
      if (this.hasOneOption())
        this.title.className += " decidimGeo__scopesDropdown__list--alone";
    }

    // Dropdown heading text
    if (this.activeScope()) {
      // specific scope
      this.titleTxt.textContent = this.activeScope().name;
    } else {
      // all scopes
      this.titleTxt.textContent = i18n["decidim_geo.scopes.dropdown"];
    }
  }
  goBackHandler() {
    geoStore.getState().goBack();
  }
  itemClickHandler() {
    const { popState } = memoryStore.getState();
    popState();
    this.toggleOpen();
    geoStore.getState().selectScope(null);
    geoStore.getState().selectPoint(null);
  }
  resetItem() {
    if (this.resetBtn) return this.resetBtn;
    const { i18n } = configStore.getState();
    const [btn, repaintBtn] = scopeDropdownItem({
      scopeId: "all",
      label: i18n["decidim_geo.scopes.all"],
      onClick: this.itemClickHandler.bind(this)
    });
    this.resetBtn = btn;
    this.repaintResetBtn = repaintBtn;
    return this.resetBtn;
  }
  repaintOptions() {
    const scopes = this.scopes();
    // Dropdown options
    L.DomUtil.empty(this.dropDownOptions);
    if (this.isEmpty()) {
      return;
    }

    // Add a "All Scope" menu item
    this.dropDownOptions.appendChild(this.resetItem());
    this.repaintResetBtn();
    // Add all the other scopes
    scopes.forEach((geoScope) => {
      geoScope.menuItemRepaint();
      this.dropDownOptions.appendChild(geoScope.menuItem);
    });
  }
  repaintOpenClose() {
    const { selectedPoint } = geoStore.getState();
    const { isOpen } = scopeDropdownStore.getState();
    const { isOpen: isFilterOpen } = dropdownFilterStore.getState();

    // Dropdown backdrop open/close
    this.title.className = createClasses("decidimGeo__scopesDropdown__title", [
      isOpen ? "open" : "closed",
      this.isEmpty() && "empty",
      this.hasOneOption() && "alone",
      selectedPoint && "button",
      isFilterOpen && "disabled"
    ]);
    this.dropDownOptions.className = createClasses("decidimGeo__scopesDropdown__list", [
      isOpen ? "open" : "closed",
      this.isEmpty() && "empty",
      selectedPoint && "hidden",
      this.hasOneOption() && "alone"
    ]);
    this.heading.className = createClasses("decidimGeo__scopesDropdown__heading", [
      isOpen ? "open" : "closed"
    ]);
    this.closeOverlay.className = createClasses("decidimGeo__scopesDropdown_overlay", [
      isOpen ? "open" : "closed"
    ]);
    this.toggleDrawer.className = createClasses(
      "decidimGeo__scopesDropdown__drawerToggle",
      [isOpen ? "open" : "closed"]
    );

    if (this.menu)
      this.menu.className =
        "leaflet-control " +
        createClasses("decidimGeo__scopesDropdown", [
          isOpen ? "open" : "closed",
          this.isEmpty() && "empty",
          selectedPoint && "hidden",
          this.hasOneOption() && "alone"
        ]);
  }
  repaint() {
    this.repaintHeading();
    this.repaintOptions();
    this.repaintOpenClose();
  }
  onAdd() {
    this.menu = L.DomUtil.create(
      "div",
      "leaflet-control decidimGeo__scopesDropdown",
      this.parent
    );
    L.DomEvent.disableClickPropagation(this.menu);
    L.DomEvent.disableScrollPropagation(this.menu);
    this.closeOverlay = L.DomUtil.create(
      "span",
      createClasses("decidimGeo__scopesDropdown_overlay", [])
    );
    L.DomEvent.disableClickPropagation(this.closeOverlay);
    L.DomEvent.disableScrollPropagation(this.closeOverlay);
    const [mapContainer] = document.getElementsByClassName("js-decidimgeo");
    this.closeOverlay.onclick = _.debounce(this.titleClickHandler.bind(this), 400, {
      leading: false
    });
    mapContainer.prepend(this.closeOverlay);

    // We we change the available scopes, repaint.
    geoStore.subscribe(
      (state) => [state.selectedScope],
      ([_geoScope], [prevGeoScope]) => {
        if (prevGeoScope) {
          prevGeoScope.repaint();
        }
        this.repaint();
      }
    );
    geoStore.subscribe(
      (state) => [state.selectedPoint],
      () => {
        this.repaint();
      }
    );
    pointStore.subscribe(
      (state) => [state.scopes, state.isLoading],
      ([scopes, isLoading]) => {
        if (!scopes || scopes.length == 0 || isLoading) return;
        this.repaint();
      }
    );
    dropdownFilterStore.subscribe(
      (state) => [state.isOpen],
      () => this.repaint()
    );
    this.initMenuElements();
    this.repaint(); // first repaint

    return this.menu;
  }
  reset() {
    scopeDropdownStore.getState().close();
  }
  close() {
    scopeDropdownStore.getState().close();
  }
}
