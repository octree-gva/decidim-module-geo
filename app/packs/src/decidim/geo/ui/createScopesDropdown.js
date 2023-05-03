const { getGeoScopes, getParticipatoryProcesses } = require("../api");
const PARTICIPATORY_PROCESS = require("../models/participatoryProcess");
const polylabel = require("polylabel");

const createClasses = (classname, modifiers) =>
  [classname, ...modifiers.map(modifier => `${classname}--${modifier}`)].join(
    " "
  );

const makeLensArray = lens => lens.split(".");

const getLensValue = (obj, lensArray) => {
  if (!obj) {
    return obj;
  }
  const [lens, ...rest] = lensArray;
  const value = obj[lens];

  if (lensArray.length > 1) {
    return getLensValue(value, rest);
  }
  return value;
};

const renderer = (prev, next, lensArray, render) => {
  const A = getLensValue(prev, lensArray);
  const B = getLensValue(next, lensArray);

  if (A !== B) {
    if (typeof render === "function") {
      return render(B);
    }
    return render[String(B)]();
  }
  return;
};

async function createScopesDropdown(map) {
  const scopes = await getGeoScopes();
  const initialState = {
    parentScope: null,
    isListOpened: false,
  };

  const CustomLayerControl = L.Control.extend({
    options: {
      collapsed: false,
      position: "topleft",
    },

    state: {},

    menu: null,
    heading: null,
    title: null,
    list: null,

    setState: function (stateUpdate) {
      const prev = this.state;
      const next = { ...prev, ...stateUpdate };
      return this.onStateUpdate(prev, next);
    },

    onStateUpdate: function (prev, next) {
      renderer(prev, next, ["isListOpened"], {
        true: () => {
          this.list.className = "decidimGeo__scopesDropdown__list";
          this.title.className = "decidimGeo__scopesDropdown__title";
        },
        false: () => {
          this.list.className = createClasses(
            "decidimGeo__scopesDropdown__list",
            ["closed"]
          );
          this.title.className = createClasses(
            "decidimGeo__scopesDropdown__title",
            ["closed"]
          );
        },
      });
      renderer(
        prev,
        next,
        makeLensArray("parentScope.name.translation"),
        async name => {
          this.title.textContent = name;
          const reset = L.DomUtil.create(
            "button",
            "decidimGeo__scopesDropdown__reset",
            this.heading
          );
          reset.textContent = "reset";
          reset.onclick = event => {
            L.DomUtil.remove(this.heading);
            L.DomUtil.remove(this.list);
            L.DomUtil.remove(reset);
            this.initMenuChildren();
            this.title.click();
          };

          L.DomUtil.empty(this.list);
          const loadingItem = L.DomUtil.create(
            "div",
            "decidimGeo__scopesDropdown__loading",
            this.list
          );
          loadingItem.textContent += "Loading";

          const participatoryProcesses = await getParticipatoryProcesses({
            variables: { filter: { scopeId: next.parentScope.id } },
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

              const markers =
                PARTICIPATORY_PROCESS.getMarkers(participatoryProcess);

              return listCard;
            }
          );

          L.DomUtil.empty(this.list);
          L.DomUtil.addClass(
            this.list,
            "decidimGeo__scopesDropdown__list--card"
          );
          participatoryProcessesList.forEach(element =>
            this.list.appendChild(element)
          );
        }
      );
      this.state = next;
    },

    initMenuChildren: function (scopeToMap) {
      this.state = initialState;
      this.heading = L.DomUtil.create(
        "div",
        createClasses("decidimGeo__scopesDropdown__heading", ["closed"]),
        this.menu
      );

      this.title = L.DomUtil.create(
        "h6",
        createClasses("decidimGeo__scopesDropdown__title", ["closed"]),
        this.heading
      );

      this.title.textContent += "All scopes";
      this.title.onclick = event => {
        event.stopPropagation();
        this.setState({ isListOpened: !this.state.isListOpened });
      };

      this.list = L.DomUtil.create(
        "ul",
        createClasses("decidimGeo__scopesDropdown__list", ["closed"]),
        this.menu
      );

      scopes.forEach(scope => {
        const menuItem = L.DomUtil.create(
          "li",
          "decidimGeo__scopesDropdown__listItem",
          this.list
        );
        menuItem.onclick = event => {
          this.setState({ parentScope: scope });
        };

        menuItem.textContent += scope.name.translation;

        if (scopeToMap) scopeToMap(scope);
      });
    },

    onAdd: function (map) {
      this.menu = L.DomUtil.create("div", "decidimGeo__scopesDropdown");
      this.menu.ondblclick = function (event) {
        event.stopPropagation();
        return false;
      };

      this.initMenuChildren(scope => {
        const layer = L.geoJSON(scope.geom, {
          style: feature => {
            return {
              fillColor: "#cccccc",
              color: "#999999",
              lineJoin: "miter",
              dashArray: "5, 10",
              dashOffset: "5",
            };
          },
        }).addTo(map);

        const label = String(scope.name.translation);
        if (scope.geom.type === "MultiPolygon") {
          let centroid = polylabel(scope.geom.coordinates[0], 1.0);
          const circle = new L.circleMarker([centroid[1], centroid[0]], {
            radius: 6,
            fillColor: "#000000",
            fillOpacity: 1,
            color: "#cccccc",
            opacity: 1,
            weight: 5,
          });
          return circle
            .bindTooltip(label, {
              permanent: true,
              opacity: 1,
              permanent: true,
              direction: "top",
              className: "decidimGeo__scope__tooltip",
            })
            .openTooltip()
            .addTo(map);
        }
        return layer;
      });

      return this.menu;
    },
  });

  const control = new CustomLayerControl();
  return map.addControl(control);
}

export default createScopesDropdown;
