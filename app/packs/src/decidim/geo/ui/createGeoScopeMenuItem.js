const createGeoScopeMenuItem = ({ label, onClick, listElement }) => {
  const menuItem = L.DomUtil.create(
    "li",
    "decidimGeo__scopesDropdown__listItem",
    listElement
  );
  menuItem.onclick = onClick;

  menuItem.textContent += label;
};

export default createGeoScopeMenuItem;
