import createClasses from "./createClasses";
import geoStore from "../stores/geoStore";
import configStore from "../stores/configStore";
import _ from "lodash";

export default class AsideToggle {
  constructor(parent) {
    this.parent = parent;
    this.raw = null;
    this.asideToggleButton = null;
  }

  initMenuElements() {
    const { isAsideOpen: isOpen } = configStore.getState();

    this.raw = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__drawerHeaderRow", ["aside-toggle"]),
      this.parent
    );

    this.asideToggleButton = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__drawerHeader__drawerToggle", [
        isOpen ? "open" : "closed"
      ]),
      this.raw
    );
    this.asideToggleButton.innerHTML = `<svg width="29" height="8" viewBox="0 0 29 8" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.519226 1.93712C0.519226 0.960255 1.487 0.278249 2.40695 0.606805L13.8483 4.69299C14.2822 4.84795 14.7563 4.84795 15.1902 4.69299L26.6315 0.606805C27.5515 0.27825 28.5192 0.960255 28.5192 1.93712V1.93712C28.5192 2.53411 28.1439 3.06665 27.5817 3.26744L15.8076 7.47247C14.9745 7.77003 14.064 7.77003 13.2308 7.47247L1.45673 3.26744C0.894517 3.06665 0.519226 2.53411 0.519226 1.93712V1.93712Z" fill="currentColor" />
</svg>
`;
    this.asideToggleButton.onclick = this.asideToggleButtonHandler.bind(this);

    this.repaint();
  }

  asideToggleButtonHandler() {
    configStore.setState(({ isAsideOpen }) => ({ isAsideOpen: !isAsideOpen }));
  }

  repaint() {
    if (!this.asideToggleButton) return;
    const { isAsideOpen: isOpen } = configStore.getState();

    this.asideToggleButton.className = createClasses(
      "decidimGeo__drawerHeader__drawerToggle",
      [isOpen ? "open" : "closed"]
    );
  }

  onAdd() {
    this.initMenuElements();
    this.repaint(); // first repaint

    // Subscribe to data change
    configStore.subscribe(
      (state) => [state.isAsideOpen],
      () => this.repaint()
    );
    return this.raw;
  }
}
