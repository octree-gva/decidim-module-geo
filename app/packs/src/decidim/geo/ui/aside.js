import configStore from "../stores/configStore";
import geoStore from "../stores/geoStore";
import createClasses from "./createClasses";

const createControl = (position) =>
  L.Control.extend({
    options: {
      collapsed: false,
      position: position
    },
    children: [],
    container: null,
    repaint() {
      const { isAsideOpen } = configStore.getState();
      this.container.className =
        "leaflet-control " +
        createClasses("decidimGeo__aside", [isAsideOpen ? "open" : "closed"]);
      const [mapContainer] = document.getElementsByClassName("js-decidimgeo");
      if (!mapContainer) throw new Error("Can not find .js-decidimgeo element in DOM");
      mapContainer.setAttribute("data-fill", isAsideOpen ? "stretch" : "truncated");
    },
    onAdd(map) {
      this.container = L.DomUtil.create(
        "div",
        "leaflet-control " + createClasses("decidimGeo__aside", ["closed"])
      );
      this.children.map((ChildKlass) => {
        const comp = new ChildKlass(this.container);
        comp.onAdd(map);
      })
      geoStore.subscribe(
        (state) => [state.selectedScope, state.selectedPoint],
        () => this.repaint()
      );
      configStore.subscribe(
        (state) => [state.isAsideOpen],
        () => this.repaint()
      );

      return this.container;
    }
  });

async function aside(children) {
  const { isSmallScreen, map } = configStore.getState();
  const controlKlass = createControl(isSmallScreen ? "bottomleft" : "topleft");
  const asideComponent = new controlKlass();
  children.map((child) => {
    asideComponent.children.push(child);
  })
  map.addControl(asideComponent);
}

export default aside;
