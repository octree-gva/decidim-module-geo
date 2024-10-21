import createClasses from "./createClasses";
import geoStore from "../stores/geoStore";
import pointStore from "../stores/pointStore";
import configStore from "../stores/configStore";
import dropdownFilterStore from "../stores/dropdownFilterStore";
import { meetings as meetingDetails, fallback as fallbackDetails } from "./DrawerDetail";

const createSkeletonItem = () => L.DomUtil.create("li", "decidimGeo__drawer__listCard");

export default class Drawer {
  constructor(parent) {
    // View
    this.cardList = null;
    this.loadingDOM = null;
    this.parent = parent;
  }

  isEmpty() {
    return false;
  }

  loadingDom() {
    if (this._loadingDOM) return this._loadingDOM;
    this._loadingDOM = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__drawer__listCardLoader")
    );
    this._loadingDOM.appendChild(createSkeletonItem());
    this._loadingDOM.appendChild(createSkeletonItem());
    this._loadingDOM.appendChild(createSkeletonItem());
    return this._loadingDOM;
  }

  repaintList(points) {
    points.map((point) => {
      this.cardList.appendChild(point.menuItem);
    });
  }
  repaintEmpty() {
    const i18n = this.i18n();
    const emptyContainer = L.DomUtil.create(
      "li",
      "decidimGeo__emptyDrawer__container",
      this.cardList
    );
    const emptyParagraph = L.DomUtil.create(
      "p",
      "decidimGeo__emptyDrawer__paragraph",
      emptyContainer
    );
    emptyParagraph.textContent = i18n["decidim_geo.filters.empty.message"];
    const emptyAction = L.DomUtil.create(
      "button",
      "decidimGeo__emptyDrawer__button",
      emptyContainer
    );
    emptyAction.textContent = i18n["decidim_geo.filters.empty.update_button"];
    emptyAction.onclick = this.emptyActionHandler.bind(this);
  }

  i18n() {
    return this.config().i18n;
  }

  config() {
    return configStore.getState();
  }
  emptyActionHandler() {
    const { open } = dropdownFilterStore.getState();
    open();
  }
  repaintLoading() {
    const loadingElement = this.loadingDom();
    this.cardList.appendChild(loadingElement);
  }
  repaintDetail({ data: node }) {
    const listCard = L.DomUtil.create(
      "li",
      "decidimGeo__drawer__listCard",
      this.cardList
    );
    listCard.onclick = () => {
      location.href = node.resourceUrl;
    };

    const info = L.DomUtil.create(
      "div",
      "decidimGeo__drawer__listCardInfo decidimGeo__drawer__listCardInfo--large",
      listCard
    );
    switch (node.resourceType) {
      case "meetings":
        meetingDetails(info, node);
        break;
      default:
        fallbackDetails(info, node);
        break;
    }
    const viewBtn = L.DomUtil.create("a", "decidimGeo__drawer__viewBtn", listCard);
    viewBtn.textContent = this.i18n()["decidim_geo.actions.view"];
    viewBtn.href = node.resourceUrl;
    this.cardList.scrollTo({top: 0})
    return listCard;
  }
  repaint() {
    L.DomUtil.empty(this.cardList);
    const { loading, getFilteredPoints } = pointStore.getState();
    const { selectedPoint } = geoStore.getState();
    const pointsInMap = getFilteredPoints();

    if (loading()) {
      return this.repaintLoading();
    }
    if (selectedPoint) {
      return this.repaintDetail(selectedPoint);
    }

    if (pointsInMap.length === 0) {
      this.repaintEmpty();
    } else {
      this.repaintList(pointsInMap);
    }

    this.cardList.className = createClasses("decidimGeo__drawer__list", [
      loading() && "loading",
      this.isEmpty() && "empty"
    ]);
  }
  onAdd() {
    if (!this.parent) throw new Error("no this.parent ");
    const { loading } = pointStore.getState();
    this.cardList = L.DomUtil.create(
      "ul",
      createClasses("decidimGeo__drawer__list", [
        loading() && "loading",
        this.isEmpty() && "empty"
      ]),
      this.parent
    );
    L.DomEvent.disableClickPropagation(this.cardList);
    L.DomEvent.disableScrollPropagation(this.cardList);

    geoStore.subscribe(
      (state) => [state.selectedPoint, state.selectedScope],
      () => {
        this.repaint();
      }
    );

    pointStore.subscribe(
      (state) => [state.isLoading, state.loading, state._lastResponse, state._lastFilter],
      ([_isLoading, loading]) => {
        if (loading()) return;
        this.repaint();
      }
    );
    this.repaint();
    return this.cardList;
  }
}
