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
        this.menuItems.push(menuItem);
        if (!this.itemsLoaded) {
            this.itemsLoaded = true;
            this.menuItems = []
        }
    }
}
export default new MenuItemStore();