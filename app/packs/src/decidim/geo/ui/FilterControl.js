import FilterButton from "./FilterButton";
import FilterModal from "./FilterModal";
import FilterModalOverlay from "./FilterModalOverlay";
const FilterControl = L.Control.extend({
  options: {
    collapsed: false,
    position: "bottomright"
  },
  container: null,
  button: null,
  overlay: null,
  modalOverlay: null,
  onAdd(map) {
    this.container = L.DomUtil.create("div", "leaflet-control decidimGeo__filter");
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.disableScrollPropagation(this.container);

    this.button = new FilterButton(this.container);
    this.button.onAdd(map);

    const modalContainer = L.DomUtil.create("div", "decidimGeo__modalContainer");
    L.DomEvent.disableClickPropagation(modalContainer);
    L.DomEvent.disableScrollPropagation(modalContainer);

    this.modal = new FilterModal(modalContainer);
    this.modal.onAdd(map);

    this.modalOverlay = new FilterModalOverlay(this.modal.container);
    this.modalOverlay.onAdd(map);

    const [mapContainer] = document.getElementsByClassName("js-decidimgeo");
    if (!mapContainer) throw new Error("Map is not instancied");
    mapContainer.prepend(modalContainer);

    return this.container;
  }
});
export default FilterControl;
