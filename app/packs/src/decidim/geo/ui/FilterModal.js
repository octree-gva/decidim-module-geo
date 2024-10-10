import createClasses from "./createClasses";
import dropdownFilterStore from "../stores/dropdownFilterStore";
import geoStore from "../stores/geoStore";
import configStore from "../stores/configStore";
import filterStore from "../stores/filterStore";
import pointStore from "../stores/pointStore";

class FilterModal {
  constructor(parent) {
    this.container = L.DomUtil.create(
      "div",
      "decidimGeo__fitlerModal__container",
      parent
    );

    this.dropdown = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__fitlerModal__form", [!this.isOpen() && "closed"]),
      this.container
    );
    this.dropDownOptions = L.DomUtil.create(
      "ul",
      "decidimGeo__fitlerModal__fieldset",
      this.dropdown
    );
    this.resetBtn = L.DomUtil.create(
      "button",
      "decidimGeo__fitlerModal__resetBtn",
      this.dropdown
    );
    this.resetBtn.textContent = this.i18n()["decidim_geo.filters.reset_button"];
    this.resetBtn.onclick = this.resetBtnHandler.bind(this);
    this.applyBtn = L.DomUtil.create(
      "button",
      "decidimGeo__fitlerModal__applyBtn",
      this.dropdown
    );
    this.applyBtn.textContent = this.i18n()["decidim_geo.filters.apply_button"];
    this.applyBtn.onclick = this.applyBtnHandler.bind(this);
  }

  applyBtnHandler() {
    const { nextFilters, toggleOpen, applyNextFilters } = dropdownFilterStore.getState();
    this.applyValues(nextFilters);
    applyNextFilters();
    toggleOpen();
  }
  resetBtnHandler() {
    const {
      resetFilters: resetDropdownFilter,
      toggleOpen,
      defaultFilters
    } = dropdownFilterStore.getState();
    resetDropdownFilter();
    this.applyValues(defaultFilters);
    toggleOpen();
  }

  isEmpty() {
    return false;
  }

  defaultFilterFor(name) {
    const { toFilterOptions, defaultFilters } = filterStore.getState();
    return toFilterOptions(name, defaultFilters);
  }
  field(label, name, options, disabledOptions = []) {
    const { nextFilters } = dropdownFilterStore.getState();
    const selectedValue =
      (nextFilters && nextFilters[name]) || this.defaultFilterFor(name);
    const fieldGroup = L.DomUtil.create(
      "li",
      "decidimGeo__fitlerModal__field",
      this.dropDownOptions
    );
    const labelTag = L.DomUtil.create(
      "label",
      "decidimGeo__fitlerModal__label",
      fieldGroup
    );
    labelTag.htmlFor = name;
    labelTag.textContent = label;

    const selectTag = L.DomUtil.create(
      "select",
      "decidimGeo__fitlerModal__select",
      fieldGroup
    );
    selectTag.id = name;
    selectTag.onchange = (evt) => {
      dropdownFilterStore.getState().setNextFilter(name, evt.target.value);
    };
    options.forEach(([key, value]) => {
      if (!key) return;
      const option = L.DomUtil.create(
        "option",
        "decidimGeo__fitlerModal__option",
        selectTag
      );
      option.name = name.toLowerCase();
      option.value = value;
      if (value === selectedValue) {
        option.selected = "selected";
      }
      if (disabledOptions.includes(value)) {
        option.disabled = "disabled";
      }
      option.textContent = key;
    });
    return selectTag;
  }

  applyValues(filters) {
    const defaultDropdownValues = {
      GeoScopeFilter: "all",
      GeoShowFilter: "all",
      GeoTimeFilter: "active",
      GeoType: "all"
    };
    if (!filters) {
      filters = defaultDropdownValues;
    }
    filters = { ...defaultDropdownValues, ...filters };
    const { setFilters, activeFilters, defaultFilters } = filterStore.getState();
    let newFilters = [...activeFilters];
    const withoutGeoShowFilter = (filters) =>
      filters.filter((f) => {
        const [filterName] = Object.keys(f);
        return filterName !== "geoencodedFilter";
      });
    const withoutTimeFilter = (filters) =>
      filters.filter((f) => {
        const [filterName] = Object.keys(f);
        return filterName !== "timeFilter";
      });
    const withoutTypeFilter = (filters) =>
      filters.filter((f) => {
        const [filterName] = Object.keys(f);
        return filterName !== "resourceTypeFilter";
      });
    const withoutGeoScopeFilter = (filters) =>
      filters.filter((f) => {
        const [filterName] = Object.keys(f);
        return filterName !== "scopeFilter";
      });

    switch (filters.GeoShowFilter || defaultFilters.GeoShowFilter) {
      case "all":
        newFilters = withoutGeoShowFilter(newFilters);

        break;
      case "geoencoded":
        newFilters = [
          ...withoutGeoShowFilter(newFilters),
          {
            geoencodedFilter: { geoencoded: true }
          }
        ];
        break;
      case "virtual":
        newFilters = [
          ...withoutGeoShowFilter(newFilters),
          {
            geoencodedFilter: { geoencoded: false }
          }
        ];
        break;
    }
    const filteredScopeId = filters.GeoScopeFilter || defaultFilters.GeoScopeFilter;

    switch (filteredScopeId) {
      case "all":
        newFilters = withoutGeoScopeFilter(newFilters);
        break;
      default:
        newFilters = [
          ...withoutGeoShowFilter(newFilters),
          {
            scopeFilter: { scopeId: `${filteredScopeId}` }
          }
        ];
        break;
    }

    const timeFilter = filters.GeoTimeFilter || defaultFilters.GeoTimeFilter;
    if (timeFilter)
      newFilters = [
        ...withoutTimeFilter(newFilters),
        {
          timeFilter: { time: timeFilter }
        }
      ];

    const resourceType = filters.GeoType || defaultFilters.GeoType;
    if (resourceType) {
      newFilters = [
        ...withoutTypeFilter(newFilters),
        {
          resourceTypeFilter: { resourceType: resourceType }
        }
      ];
    }
    setFilters(newFilters);
  }
  scopeFields(scopes) {
    const i18n = this.i18n();
    const i18nPrefix = "decidim_geo.scopes";
    return this.field(
      i18n[`${i18nPrefix}.dropdown`],
      "GeoScopeFilter",
      [[i18n[`${i18nPrefix}.all`], "all"]].concat(
        scopes.map((scope) => [
          scope.data.name.translation || scope.data.name.defaultTranslation,
          `${scope.id}`
        ])
      ),
      []
    );
  }
  geoFields(points) {
    const i18n = this.i18n();
    const i18nPrefix = "decidim_geo.filters";

    const hasGeoLocated = points.find((p) => p.isGeoLocated());
    const hasPhysical = points.find((p) => !p.isGeoLocated());
    return this.field(
      i18n[`${i18nPrefix}.geo.label`],
      "GeoShowFilter",
      [
        [i18n[`${i18nPrefix}.geo.all`], "all"],
        [i18n[`${i18nPrefix}.geo.geoencoded`], "geoencoded"],
        [i18n[`${i18nPrefix}.geo.virtual`], "virtual"]
      ],
      hasGeoLocated && hasPhysical ? [] : ["geoencoded", "virtual"]
    );
  }
  repaintOptions() {
    const { isProcessOnly, isAssemblyOnly } = filterStore.getState();

    L.DomUtil.empty(this.dropDownOptions);
    const i18n = this.i18n();
    const i18nPrefix = "decidim_geo.filters";
    const { points, scopes } = pointStore.getState();
    this.scopeFields(scopes);
    this.geoFields(points);
    this.field(i18n[`${i18nPrefix}.time.label`], "GeoTimeFilter", [
      [i18n[`${i18nPrefix}.time.all`], "all"],
      [i18n[`${i18nPrefix}.time.past`], "past"],
      [i18n[`${i18nPrefix}.time.active`], "active"],
      [i18n[`${i18nPrefix}.time.future`], "future"]
    ]);
    if (!isProcessOnly() && !isAssemblyOnly()) {
      this.typeFields(points);
    }
  }

  typeFields(points) {
    const activeManifests = configStore.getState().activeManifests || [];

    const i18n = this.i18n();
    const i18nPrefix = "decidim_geo.filters";

    const disabledOptions = activeManifests.filter((manifestName) => {
      return !points.find((p) => p.resourceType === manifestName);
    });
    const fieldLabel = i18n[`${i18nPrefix}.type.label`];

    this.field(
      fieldLabel,
      "GeoType",
      [
        [i18n[`${i18nPrefix}.type.all`], "all"],
        ...activeManifests.map((manifestName) => [
          i18n[`${i18nPrefix}.type.${manifestName}`],
          manifestName
        ])
      ],
      disabledOptions
    );
  }

  repaint() {
    this.container.className = createClasses("decidimGeo__fitlerModal__container", [
      !this.isOpen() && "closed"
    ]);
    this.dropdown.className = createClasses("decidimGeo__fitlerModal__form", [
      !this.isOpen() && "closed"
    ]);

    this.repaintOptions();
  }

  isOpen() {
    return dropdownFilterStore.getState().isOpen;
  }

  toggle() {
    dropdownFilterStore.getState().toggleOpen();
  }

  i18n() {
    return this.config().i18n;
  }

  config() {
    return configStore.getState();
  }

  onAdd(_map) {
    dropdownFilterStore.subscribe(
      (state) => [state.isOpen, state.selectedFilters],
      () => this.repaint()
    );
    filterStore.subscribe(
      (state) => [state.activeFilters],
      () => this.repaint()
    );
    pointStore.subscribe(
      (state) => [state.loading],
      () => this.repaint()
    );
    geoStore.subscribe(
      (state) => [state.selectedScope],
      () => this.repaint()
    );
  }
}

export default FilterModal;
