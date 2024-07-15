import geoStore from "../models/geoStore";
const createGeoScopeMenuItem = ({ label, onClick, scopeId = undefined }) => {
  const menuItem = L.DomUtil.create("li", "decidimGeo__scopesDropdown__listItem");
  menuItem.onclick = onClick;
  menuItem.textContent += label;
  if (scopeId) menuItem.setAttribute("data-scope", scopeId);
  const { selectedScope: { id } = {} } = geoStore;
  if (`${scopeId}` === `${id}`) {
    menuItem.className =
      "decidimGeo__scopesDropdown__listItem decidimGeo__scopesDropdown__listItem--active";
  } else {
    menuItem.className = "decidimGeo__scopesDropdown__listItem";
  }
  return menuItem;
};

export default createGeoScopeMenuItem;
