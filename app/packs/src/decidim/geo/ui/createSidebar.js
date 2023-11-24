import MenuItemStore from "../models/menuItemStore";
import {createDomElement} from "./createDomElement";
import createClasses from "./createClasses";

const createSkeletonItem = () => createDomElement(
    "li",
    "decidimGeo__sidebar__listCard"
  );

async function createSidebar(map, config, eventHandler) {
    const CustomLayerControl = L.Control.extend({
        options: {
            collapsed: false,
            position: "topleft",
        },
        // Model
        isLoading: true,
        menuItems: MenuItemStore.menuItems,
        // View
        cardList: null,
        _loadingDOM: null,

        isEmpty() {
            return false;
        },
        reset() {
            this.menuItems = MenuItemStore.menuItems
        },
        loadingDom() {
            if (!this._loadingDOM)
                this._loadingDOM = L.DomUtil.create(
                    "div",
                    createClasses(
                        "decidimGeo__sidebar__listCardLoader"
                    )
                );
            this.cardList.appendChild(createSkeletonItem())
            this.cardList.appendChild(createSkeletonItem())
            this.cardList.appendChild(createSkeletonItem())
            return this._loadingDOM
        },
        repaint() {
            L.DomUtil.empty(this.cardList)
            const loadingElement = this.loadingDom()
            if (this.isLoading) {
                this.cardList.appendChild(loadingElement)
                return;
            }
            this.menuItems.forEach(menuItem => {
                this.cardList.appendChild(menuItem)
            })
        },
        onAdd(map) {
            this.cardList = L.DomUtil.create(
                "ul",
                createClasses(
                    "decidimGeo__sidebar__list",
                    [this.isLoading && "loading", this.isEmpty() && "empty"]
                )
            );
            L.DomEvent.disableClickPropagation(this.cardList);
            L.DomEvent.disableScrollPropagation(this.cardList);
            this.repaint();
            eventHandler.on("selectScope", (geoScope) => {
                this.menuItems = geoScope.nodes.map(({menuItem}) => menuItem)
                this.isLoading = false;
                this.repaint()
            });
            eventHandler.on("selectAllScopes", () => {
                this.isLoading = false;
                this.reset();
                this.repaint();
            });

            return this.cardList
        }
    });
    const control = new CustomLayerControl();
    map.addControl(control);
}

export default createSidebar
