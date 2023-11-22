const createGeoScopeMenuItem = ({ label, onClick }) => {
  const menuItem = L.DomUtil.create(
    "li",
    "decidimGeo__scopesDropdown__listItem"
  );
  menuItem.onclick = onClick;
  menuItem.textContent += label;
  return menuItem;
};

export default createGeoScopeMenuItem;
