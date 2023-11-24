import {createDomElement} from '../../ui/createDomElement'

const skeletonItem = createDomElement(
    "li",
    "decidimGeo__sidebar__listCard"
  );

class MenuItemStore {
    constructor() {
        this.menuItems = [skeletonItem,skeletonItem,skeletonItem]
    }

    addMenuItem(menuItem) {
        this.menuItems.push(menuItem);
    }
}
export default new MenuItemStore();