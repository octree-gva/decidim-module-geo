import createClasses from "./createClasses";
import dropdownFilterStore from "../stores/dropdownFilterStore";
import geoStore from "../stores/geoStore";
import configStore from "../stores/configStore";
import filterStore from "../stores/filterStore";

class FilterButton {
  constructor(parent) {
    this.parent = parent;

    this.titleContainer = L.DomUtil.create(
      "div",
      "decidimGeo__filterToggle",
      this.parent
    );
    this.title = L.DomUtil.create(
      "h6",
      "decidimGeo__filterToggle__button",
      this.titleContainer
    );
    this.countBadge = L.DomUtil.create(
      "span",
      createClasses("decidimGeo__filterToggle__counter", ["hidden"]),
      this.titleContainer
    );
    this.countBadge.textContent = 0;

    this.title.innerHTML = `<svg aria-label="${this.i18n()["decidim_geo.filters.button"]}" width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.198 0.548096H2.198V6.5481H4.198V0.548096ZM16.198 0.548096H14.198V10.5481H16.198V0.548096ZM0.197998 10.5481H2.198V18.5481H4.198V10.5481H6.198V8.5481H0.197998V10.5481ZM12.198 4.5481H10.198V0.548096H8.198V4.5481H6.198V6.5481H12.198V4.5481ZM8.198 18.5481H10.198V8.5481H8.198V18.5481ZM12.198 12.5481V14.5481H14.198V18.5481H16.198V14.5481H18.198V12.5481H12.198Z" fill="currentColor"/>
</svg>`;
    this.title.onclick = this.handleFilterButtonClick.bind(this);
  }
  handleFilterButtonClick() {
    this.toggle();
    this.repaint();
  }

  defaultFilterFor(name) {
    const { toFilterOptions, defaultFilters } = filterStore.getState();
    return toFilterOptions(name, defaultFilters);
  }

  repaint() {
    const { selectedPoint } = geoStore.getState();
    const { filterCount } = dropdownFilterStore.getState();
    const badgeCount = filterCount();
    this.title.onclick = selectedPoint
      ? () => {}
      : this.handleFilterButtonClick.bind(this);
    this.countBadge.className = createClasses("decidimGeo__filterToggle__counter", [
      badgeCount === 0 && "hidden"
    ]);
    this.countBadge.textContent = badgeCount;
    this.title.className = "decidimGeo__filterToggle__button";
    this.titleContainer.className = createClasses("decidimGeo__filterToggle", [
      selectedPoint && "disabled"
    ]);
  }

  toggle() {
    configStore.getState().closeAside().then(() => {
      dropdownFilterStore.getState().toggleOpen();
    })
  }

  i18n() {
    return this.config().i18n;
  }

  config() {
    return configStore.getState();
  }

  onAdd(_map) {
    dropdownFilterStore.subscribe(
      (state) => [state.isOpen, state.selectedFilters],
      () => this.repaint()
    );
    filterStore.subscribe(
      (state) => [state.activeFilters],
      () => this.repaint()
    );
  }
}

export default FilterButton;
