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
        _loadingDOMElements: null,

        isEmpty() {
            return false;
        },
        reset() {
            this.menuItems = MenuItemStore.menuItems
        },
        loadingDom() {
            if (!this._loadingDOMElements){
                this._loadingDOMElements = [
                    createSkeletonItem(),
                    createSkeletonItem(),
                    createSkeletonItem()
                ]
            }
                
            return this._loadingDOMElements
        },
        repaint() {
            L.DomUtil.empty(this.cardList)
            
            if (this.isLoading) {
                this._loadingDOMElements.map(skeletonItem => this.cardList.appendChild(skeletonItem))
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
