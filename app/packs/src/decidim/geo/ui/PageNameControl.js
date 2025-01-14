import configStore from "../stores/configStore";
const PageNameControl = L.Control.extend({
  options: {
    collapsed: false,
    position: "topleft"
  },
  container: null,
  button: null,
  overlay: null,
  modalOverlay: null,
  modalHelpText: null,
  onAdd(map) {
    this.container = L.DomUtil.create(
      "div",
      "leaflet-control decidimGeo__pageName__container"
    );
    this.text = L.DomUtil.create(
      "div",
      "leaflet-control decidimGeo__pageName__text",
      this.container
    );
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.disableScrollPropagation(this.container);
    this.text.title = this.text.textContent = configStore.getState().pageName;

    configStore.subscribe(
      (state) => [state.pageName],
      ([pageName]) => (this.text.title = this.text.textContent = pageName)
    );
    return this.container;
  }
});
export default PageNameControl;
