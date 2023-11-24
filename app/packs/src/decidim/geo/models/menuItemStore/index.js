import {createDomElement} from '../../ui/createDomElement'

const createSkeletonItem = () => createDomElement(
    "li",
    "decidimGeo__sidebar__listCard"
  );

class MenuItemStore {
    constructor() {
        this.menuItems = [
            createSkeletonItem(),
            createSkeletonItem(),
            createSkeletonItem()
        ]
        this.itemsLoaded = false;
    }

    addMenuItem(menuItem) {
        if (!this.itemsLoaded) {
            this.itemsLoaded = true;
            this.menuItems = []
        }
        this.menuItems.push(menuItem);
    }
}
export default new MenuItemStore();