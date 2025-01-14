import createClasses from "./createClasses";
import dropdownFilterStore from "../stores/dropdownFilterStore";
import _ from "lodash";

class FilterModalOverlay {
  constructor(parent) {
    this.parent = parent;
    this.closeOverlay = L.DomUtil.create(
      "span",
      createClasses("decidimGeo__modalOverlay", ["closed"]),
      this.parent
    );
    this.closeOverlay.onclick = _.debounce(this.handleOverlayClick.bind(this), 400, {
      leading: false
    });
  }
  toggleOpen() {
    dropdownFilterStore.setState(({ selectedFilters }) => ({
      nextFilters: { ...selectedFilters }
    }));

    dropdownFilterStore.getState().toggleOpen();
  }

  handleOverlayClick() {
    this.toggleOpen();
    this.repaint();
  }
  repaint() {
    const { isOpen } = dropdownFilterStore.getState();

    this.closeOverlay.className = createClasses("decidimGeo__modalOverlay", [
      isOpen ? "open" : "closed"
    ]);
  }
  onAdd(_map) {
    dropdownFilterStore.subscribe(
      (state) => [state.isOpen, state.selectedFilters],
      () => this.repaint()
    );
  }
}

export default FilterModalOverlay;
