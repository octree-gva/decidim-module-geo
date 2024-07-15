import configStore from "../models/configStore";
import geoStore from "../models/geoStore";
import scopeDropdownStore from "../models/scopeDropdownStore";
import createClasses from "./createClasses";

const edgeSwipper = async (position) => {
  const EdgeSwipperControl = L.Control.extend({
    options: {
      collapsed: false,
      position: position
    },

    //View
    button: null,
    container: null,
    isUp: false,
    mapPane: null,
    //Controlers
    repaint() {
      const { map } = configStore.getState();

      this.container.className =
        "leaflet-bottom leaflet-left " +
        createClasses("decidimGeo__aside", [this.isUp ? "open" : "closed"]);
      this.mapPane.setAttribute("data-fill", this.isUp ? "truncated" : "full");
      map.invalidateSize();
    },
    toggleSlide() {
      this.isUp = !this.isUp;
      this.repaint();
    },
    isOpen() {
      return this.isUp;
    },
    onAdd(map) {
      this.button = L.DomUtil.create("div", "decidimGeo__edgeSwipper");
      this.button.onclick = this.toggleSlide.bind(this);

      const [mapPane] = document.getElementsByClassName("js-decidimgeo decidimgeo__map")
      this.mapPane = mapPane
      const repaint = this.repaint.bind(this);
      const toggleSlide = this.toggleSlide.bind(this);
      const isOpen = this.isOpen.bind(this);
      geoStore.subscribe(
        (state) => [state.selectedPoint, state.selectedScope],
        ([selectedPoint, selectedScope]) => {
          if (isOpen()) return repaint();
          if (selectedPoint || selectedScope) toggleSlide();
          repaint();
        }
      );

      L.DomUtil.create("hr", "decidimGeo__scopesDropdown_separator", this.button);
      const [aside] = document.getElementsByClassName("leaflet-bottom leaflet-left");
      if (!aside) {
        throw new Error("className not found: .leaflet-bottom.leaflet-left");
      }
      this.container = aside;
      L.DomEvent.disableClickPropagation(this.button);
      L.DomEvent.disableScrollPropagation(this.button);
      this.repaint(); // first repaint
      scopeDropdownStore.subscribe(
        (state) => [state.isOpen],
        ([]) => {
          this.repaint();
        }
      );
      return this.button;
    }
  });

  const control = new EdgeSwipperControl();
  const { map } = configStore.getState();
  map.addControl(control);
};

async function createSlideEdge(children) {
  const { isFullscreen } = configStore.getState();
  const position = isFullscreen ? "bottomleft" : "topleft";
  const sections = isFullscreen ? [...children, edgeSwipper] : children;
  return await Promise.all(sections.map(async (child) => await child(position)));
}

export default createSlideEdge;
