import createClasses from "./createClasses";
import geoStore from "../stores/geoStore";
import pointStore from "../stores/pointStore";
import configStore from "../stores/configStore";
import filterStore from "../stores/filterStore";
import dropdownFilterStore from "../stores/dropdownFilterStore";
import { meetings as meetingDetails, fallback as fallbackDetails } from "./DrawerDetail";

const createSkeletonItem = () => L.DomUtil.create("li", "decidimGeo__drawer__listCard");

export default class Drawer {
    constructor(parent) {
      // View
      this.cardList = null;
      this.loadingDOM = null;
      this.parent = parent
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
      points.map(({ menuItem }) => {
        this.cardList.appendChild(menuItem);
      });
    }
    repaintEmpty() {
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
      emptyParagraph.textContent = "No data with these filters";
      const emptyAction = L.DomUtil.create(
        "button",
        "decidimGeo__emptyDrawer__button",
        emptyContainer
      );
      emptyAction.textContent = "Reset filter";
      emptyAction.onclick = this.emptyActionHandler.bind(this)
    }
    emptyActionHandler() {
      const { resetFilters } = filterStore.getState();
      const { resetFilters: resetDropdownFilter } = dropdownFilterStore.getState();
      const { selectScope } = geoStore.getState();
      const { space_ids } = configStore.getState();
      const { scopeForId } = pointStore.getState();

      resetFilters();
      resetDropdownFilter();
      const scopes = space_ids.map((scope) => scopeForId(scope)).filter(Boolean);
      if (scopes.length === 1) {
        const scope = scopeForId(scopes[0]);
        if (scope) {
          selectScope(scope);
          scope.repaint();
        }
      } else {
        selectScope(null);
      }
      this.repaint();

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
        location.href = node.link;
      };;

      const info = L.DomUtil.create(
        "div",
        "decidimGeo__drawer__listCardInfo decidimGeo__drawer__listCardInfo--large",
        listCard
      );
      switch (node.type) {
        case "Decidim::Meetings::Meeting":
          meetingDetails(info, node);
          break;
        default:
          fallbackDetails(info, node);
          break;
      }
      const viewBtn = L.DomUtil.create("a", "decidimGeo__drawer__viewBtn", listCard);
      viewBtn.textContent = "View";
      viewBtn.href = node.link;
      return listCard;
    }
    repaint() {
      L.DomUtil.empty(this.cardList);
      const { isLoading, getFilteredPoints } = pointStore.getState();
      const { selectedPoint } = geoStore.getState();
      const pointsInMap = getFilteredPoints();

      if (isLoading) {
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
        isLoading && "loading",
        this.isEmpty() && "empty"
      ]);
    }
    onAdd() {
      if (!this.parent )
        throw new Error("no this.parent ");
      const { isLoading } = pointStore.getState();
      this.cardList = L.DomUtil.create(
        "ul",
        createClasses("decidimGeo__drawer__list", [
          isLoading && "loading",
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
        (state) => [state.isLoading, state._lastResponse, state._lastFilter],
        ([isLoading, lastResponse, lastFilter]) => {
          if(isLoading) return;
          console.log("lastResponse", lastResponse, lastFilter)
          this.repaint();
        }
      );
      this.repaint();
      return this.cardList;
    }
  }

