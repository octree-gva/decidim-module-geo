import createClasses from "./createClasses";
import { createDomElement } from "./createDomElement";
import geoStore from "../models/geoStore";
import pointStore from "../models/pointStore";
import configStore from "../models/configStore";
const createSkeletonItem = () => createDomElement("li", "decidimGeo__sidebar__listCard");

async function createSidebar() {
  const CustomLayerControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft"
    },

    // View
    cardList: null,
    _loadingDOM: null,

    isEmpty() {
      return false;
    },

    loadingDom() {
      if (this._loadingDOM) return this._loadingDOM;
      this._loadingDOM = L.DomUtil.create(
        "div",
        createClasses("decidimGeo__sidebar__listCardLoader")
      );
      this._loadingDOM.appendChild(createSkeletonItem());
      this._loadingDOM.appendChild(createSkeletonItem());
      this._loadingDOM.appendChild(createSkeletonItem());
      return this._loadingDOM;
    },
    repaint() {
      L.DomUtil.empty(this.cardList);
      const { isLoading, getFilteredPoints } = pointStore.getState();
      if (isLoading) {
        const loadingElement = this.loadingDom();
        this.cardList.appendChild(loadingElement);
        return;
      }
      getFilteredPoints().map(({ menuItem }) => {
        this.cardList.appendChild(menuItem);
      });
    },
    onAdd(map) {
      const { isLoading, points } = pointStore.getState();
      this.cardList = L.DomUtil.create(
        "ul",
        createClasses("decidimGeo__sidebar__list", [
          isLoading && "loading",
          this.isEmpty() && "empty"
        ])
      );
      L.DomEvent.disableClickPropagation(this.cardList);
      L.DomEvent.disableScrollPropagation(this.cardList);

      const _this = this;
      const repaint = this.repaint.bind(this);
      geoStore.subscribe(
        (state) => [state.selectedScope],
        ([]) => {
          repaint();
        }
      );

      pointStore.subscribe(
        (state) => [state.isLoading, state._lastResponse],
        ([isLoading]) => {
          if (!isLoading) repaint();
        }
      );
      this.repaint();
      return this.cardList;
    }
  });
  const control = new CustomLayerControl();
  const { map } = configStore.getState();
  map.addControl(control);
}

export default createSidebar;
