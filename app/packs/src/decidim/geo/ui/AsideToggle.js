import createClasses from "./createClasses";
import configStore from "../stores/configStore";
import geoStore from "../stores/geoStore";
import _ from "lodash";
import pointCounterStore from "../stores/pointCounterStore";

export default class AsideToggle {
  constructor(parent) {
    this.parent = parent;
    this.raw = null;
    this.asideToggleButton = null;
    this.resultCount = 0;
    this.isHidden = false;
  }

  initDOM() {
    const { isAsideOpen: isOpen } = configStore.getState();

    this.raw = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__drawerHeaderRow", [
        "aside-toggle",
        this.isHidden && "hidden"
      ]),
      this.parent
    );

    this.asideToggleButton = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__drawerHeader__drawerToggle", [
        isOpen ? "open" : "closed"
      ]),
      this.raw
    );
    this.asideToggleButton.textContent = this.countText();
    this.asideToggleButton.onclick = this.asideToggleButtonHandler.bind(this);
  }

  countText() {
    const i18n = this.i18n();

    if (this.resultCount === 0) {
      return i18n[`decidim_geo.filters.results.zero`];
    } else {
      return i18n[
        `decidim_geo.filters.results.${this.resultCount === 1 ? "one" : "other"}`
      ].replaceAll("%count%", this.resultCount);
    }
  }
  asideToggleButtonHandler() {
    if (this.resultCount === 0) return;
    configStore.setState(({ isAsideOpen }) => ({ isAsideOpen: !isAsideOpen }));
  }

  repaint() {
    if (!this.asideToggleButton) return;
    const { isAsideOpen: isOpen } = configStore.getState();

    this.asideToggleButton.className = createClasses(
      "decidimGeo__drawerHeader__drawerToggle",
      [isOpen ? "open" : "closed", this.resultCount === 0 ? "text" : "link"]
    );
    this.asideToggleButton.textContent = this.countText();

    this.raw.className = createClasses("decidimGeo__drawerHeaderRow", [
      "aside-toggle",
      this.isHidden && "hidden"
    ]);
  }

  i18n() {
    return this.config().i18n;
  }

  config() {
    return configStore.getState();
  }
  onAdd(_map) {
    this.initDOM();
    this.repaint(); // first repaint

    // Subscribe to data change
    configStore.subscribe(
      (state) => [state.isAsideOpen],
      () => this.repaint()
    );
    geoStore.subscribe(
      (state) => [state.selectedPoint],
      ([selectedPoint]) => {
        if (!!selectedPoint === this.isHidden) {
          return;
        }
        this.isHidden = !!selectedPoint;
        this.repaint();
      }
    );
    pointCounterStore.subscribe(
      (state) => [state.count],
      ([count]) => {
        if (count === this.resultCount) return;
        this.resultCount = count;
        this.repaint();
      }
    );
    return this.raw;
  }
}
