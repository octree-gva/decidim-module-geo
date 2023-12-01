class MenuItemStore {
    constructor() {
        this.menuItems = []
    }

    addMenuItem(menuItem) {
        this.menuItems.push(menuItem);
    }
}
export default new MenuItemStore();