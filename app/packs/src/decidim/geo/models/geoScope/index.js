const { createGeoScopeMenuItem, createGeoScopeLayer } = require("../../ui");
const { getParticipatoryProcesses } = require("../../api");

export default class GeoScope {
  constructor({ geoScope, map, menuElements, menuActions }) {
    //Model
    this.data = geoScope;
    this.isActive = false;
    this.isDisabled = false;

    //View
    this.map = map;
    this.menuElements = menuElements;
    this.menuActions = menuActions;
  }

  async select() {
    this.isActive = true;
    this.menuActions.reset();
    this.menuActions.switchIsListOpened(true);

    this.menuElements.title.textContent = this.data.name.translation;
    const reset = L.DomUtil.create(
      "button",
      "decidimGeo__scopesDropdown__reset",
      this.menuElements.heading
    );
    reset.textContent = "reset";
    reset.onclick = this.menuActions.reset;

    this.layer.setStyle({ fillColor: "#2952A340", color: "#2952A3" });

    L.DomUtil.empty(this.menuElements.list);
    const loadingItem = L.DomUtil.create(
      "div",
      "decidimGeo__scopesDropdown__loading",
      this.menuElements.list
    );
    loadingItem.textContent += "Loading";

    const participatoryProcesses = await getParticipatoryProcesses({
      variables: { filter: { scopeId: this.data.id } },
    });
    const participatoryProcessesList = participatoryProcesses.map(
      participatoryProcess => {
        const listCard = L.DomUtil.create(
          "li",
          "decidimGeo__scopesDropdown__listCard"
        );
        const image = L.DomUtil.create(
          "img",
          "decidimGeo__scopesDropdown__listCardImg",
          listCard
        );
        image.src = participatoryProcess.bannerImage;

        const info = L.DomUtil.create(
          "div",
          "decidimGeo__scopesDropdown__listCardInfo",
          listCard
        );

        const infoType = L.DomUtil.create(
          "div",
          "decidimGeo__scopesDropdown__listCardType",
          info
        );
        infoType.textContent += "process";

        const infoTitle = L.DomUtil.create(
          "div",
          "decidimGeo__scopesDropdown__listCardTitle",
          info
        );
        infoTitle.textContent += participatoryProcess.title.translation;

        const infoDescription = L.DomUtil.create(
          "div",
          "decidimGeo__scopesDropdown__listCardDescription",
          info
        );
        infoDescription.textContent +=
          participatoryProcess.shortDescription.translation.replace(
            /<[^>]+>/g,
            ""
          );

        return listCard;
      }
    );

    L.DomUtil.empty(this.menuElements.list);
    L.DomUtil.addClass(
      this.menuElements.list,
      "decidimGeo__scopesDropdown__list--card"
    );
    participatoryProcessesList.forEach(element =>
      this.menuElements.list.appendChild(element)
    );
  }

  unSelect() {
    this.isActive = false;

    this.layer.setStyle({ fillColor: "#cccccc", color: "#999999" });
  }

  init() {
    this.layer = createGeoScopeLayer({
      geoScope: this.data,
      map: this.map,
      onClick: this.select.bind(this),
    });
    this.menuItem = createGeoScopeMenuItem({
      label: this.data.name.translation,
      onClick: this.select.bind(this),
    });
  }
}
