import createClasses from "./createClasses";
import geoStore from "../stores/geoStore";
import pointStore from "../stores/pointStore";
import configStore from "../stores/configStore";
import dropdownFilterStore from "../stores/dropdownFilterStore";
import _ from "lodash";
import AsideToggle from "./AsideToggle";

export default class DrawerHeader {
  //View
  constructor(parent) {
    this.parent = parent;
    this.menu = null;
    this.heading = null;
    this.titleBack = null;
    this.toggleDrawer = null;
  }

  initMenuElements() {
    const { selectedPoint } = geoStore.getState();
    const { isOpen } = dropdownFilterStore.getState();
    const { i18n, isAsideOpen } = configStore.getState();

    this.heading = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__drawerHeader__heading", [
        isOpen || (isAsideOpen && "closed")
      ]),
      this.menu
    );
    const firstRow = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__drawerHeaderRow", ["filters"]),
      this.heading
    );

    this.titleBack = L.DomUtil.create(
      "span",
      createClasses("decidimGeo__drawerHeader__backButton", [
        "back",
        !selectedPoint && "hidden"
      ]),
      firstRow
    );
    this.titleBack.innerHTML = `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16.0413 17.1115L11.4613 12.5315L16.0413 7.94149L14.6313 6.53149L8.63135 12.5315L14.6313 18.5315L16.0413 17.1115Z" fill="currentColor"/>
</svg><span>${i18n["decidim_geo.filters.back"]}</span>`;

    this.toggleDrawer = new AsideToggle(this.heading);

    this.repaint();
  }

  repaint() {
    const { selectedPoint } = geoStore.getState();

    this.titleBack.className = createClasses("decidimGeo__drawerHeader__backButton", [
      "back",
      !selectedPoint && "hidden"
    ]);
    if (selectedPoint) {
      this.titleBack.onclick = this.goBackHandler.bind(this);
      return;
    } else {
      this.titleBack.onclick = () => {};
    }
  }

  goBackHandler() {
    geoStore.getState().goBack();
  }

  onAdd() {
    this.menu = L.DomUtil.create(
      "div",
      "leaflet-control decidimGeo__drawerHeader",
      this.parent
    );
    L.DomEvent.disableClickPropagation(this.menu);
    L.DomEvent.disableScrollPropagation(this.menu);

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
    configStore.subscribe(
      ({ isAsideOpen }) => [isAsideOpen],
      () => this.repaint()
    );
    this.initMenuElements();
    this.toggleDrawer.onAdd();

    this.repaint(); // first repaint
    this.toggleDrawer.repaint();
    return this.menu;
  }
}
