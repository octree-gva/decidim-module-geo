import createClasses from "./createClasses";
import dropdownFilterStore from "../stores/dropdownFilterStore";
import geoStore from "../stores/geoStore";
import configStore from "../stores/configStore";
import filterStore from "../stores/filterStore";
import pointStore from "../stores/pointStore";
import scopeDropdownStore from "../stores/scopeDropdownStore";
class FilterDropdown {
  constructor(parent, asideEl) {
    this.asideEl = asideEl;
    this.container = L.DomUtil.create(
      "div",
      "decidimGeo__filterDropdown__container",
      parent
    );
    this.titleContainer = L.DomUtil.create(
      "div",
      "decidimGeo__filterDropdown__titleContainer",
      this.container
    );
    this.title = L.DomUtil.create(
      "h6",
      createClasses("decidimGeo__filterDropdown__title", [
        this.isOpen() && "active",
        this.isEmpty() && "empty"
      ]),
      this.titleContainer
    );
    this.countBadge = L.DomUtil.create(
      "span",
      createClasses("decidimGeo__filterDropdown__counter", ["hidden"]),
      this.titleContainer
    );
    this.countBadge.textContent = 0;

    this.dropdown = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__filterDropdown__dropdown", [!this.isOpen() && "closed"]),
      this.asideEl
    );
    this.dropDownOptions = L.DomUtil.create(
      "ul",
      "decidimGeo__filterDropdown__list",
      this.dropdown
    );
    this.resetBtn = L.DomUtil.create(
      "button",
      "decidimGeo__filterDropdown__resetBtn",
      this.dropdown
    );
    this.resetBtn.textContent = this.i18n()["decidim_geo.filters.reset_button"];
    this.resetBtn.onclick = this.resetBtnHandler.bind(this);
    this.applyBtn = L.DomUtil.create(
      "button",
      "decidimGeo__filterDropdown__applyBtn",
      this.dropdown
    );
    this.applyBtn.textContent = this.i18n()["decidim_geo.filters.apply_button"];

    this.applyBtn.onclick = this.applyBtnHandler.bind(this);

    this.title.textContent = this.i18n()["decidim_geo.filters.button"];
    this.title.onclick = this.titleHandler.bind(this);

    dropdownFilterStore.subscribe(
      (state) => [state.isOpen],
      () => this.repaint()
    );
    scopeDropdownStore.subscribe(
      (state) => [state.isOpen],
      () => this.repaint()
    );
    filterStore.subscribe(
      (state) => [state.activeFilters],
      () => this.repaint()
    );
  }
  titleHandler() {
    if (this.isEmpty()) return;
    this.toggle();
    this.repaint();
  }
  applyBtnHandler() {
    const { nextFilters, toggleOpen, applyNextFilters } = dropdownFilterStore.getState();
    this.applyValues(nextFilters);
    applyNextFilters();
    toggleOpen();
    this.repaint();
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
      "decidimGeo__filterDropdown__field",
      this.dropDownOptions
    );
    const labelTag = L.DomUtil.create(
      "label",
      "decidimGeo__filterDropdown__label",
      fieldGroup
    );
    labelTag.htmlFor = name;
    labelTag.textContent = label;

    const selectTag = L.DomUtil.create(
      "select",
      "decidimGeo__filterDropdown__select",
      fieldGroup
    );
    selectTag.id = name;
    selectTag.onchange = (evt) => {
      dropdownFilterStore.getState().setNextFilter(name, evt.target.value);
    };
    options.forEach(([key, value]) => {
      const option = L.DomUtil.create(
        "option",
        "decidimGeo__filterDropdown__option",
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

  geoFields(points) {
    const i18n = this.i18n();
    const i18nPrefix = "decidim_geo.filters";
    _;
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
    L.DomUtil.empty(this.dropDownOptions);
    const i18n = this.i18n();
    const i18nPrefix = "decidim_geo.filters";
    const { points } = pointStore.getState();
    this.geoFields(points);
    this.field(i18n[`${i18nPrefix}.time.label`], "GeoTimeFilter", [
      [i18n[`${i18nPrefix}.time.all`], "all"],
      [i18n[`${i18nPrefix}.time.past`], "past"],
      [i18n[`${i18nPrefix}.time.active`], "active"],
      [i18n[`${i18nPrefix}.time.future`], "future"]
    ]);
    this.typeFields(points);
  }

  typeFields(points) {
    const { isProcessOnly, isAssemblyOnly } = filterStore.getState();
    const activeManifests = configStore.getState().activeManifests || [];

    const i18n = this.i18n();
    const i18nPrefix = "decidim_geo.filters";
    const hasMeetings = points.find((p) => p.type === "meetings");
    const hasProposals = points.find((p) => p.type === "proposals");
    const hasAssemblies = points.find((p) => p.type === "debates");
    const hasProcesses = points.find((p) => p.type === "participatory_processes");
    const hasDebates = points.find((p) => p.type === "debates");
    const hasAccountabilities = points.find((p) => p.type === "accountability");
    const disabledOptions = [];
    if (!hasMeetings) disabledOptions.push("meetings");
    if (!hasProposals) disabledOptions.push("proposals");
    if (!hasAssemblies) disabledOptions.push("assemblies");
    if (!hasProcesses) disabledOptions.push("processes");
    if (!hasDebates) disabledOptions.push("debates");
    if (!hasAccountabilities) disabledOptions.push("accountability");

    const fieldLabel = i18n[`${i18nPrefix}.type.label`];
    if (isProcessOnly()) {
      this.field(fieldLabel, "GeoType", [
        [i18n[`${i18nPrefix}.type.processes`], "processes"]
      ]);
      return;
    }
    if (isAssemblyOnly()) {
      this.field(fieldLabel, "GeoType", [
        [i18n[`${i18nPrefix}.type.assemblies`], "assemblies"]
      ]);
      return;
    }

    this.field(
      i18n[`${i18nPrefix}.type.label`],
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
    const { selectedPoint } = geoStore.getState();
    const { filterCount } = dropdownFilterStore.getState();
    const { isOpen: isScopeOpen } = scopeDropdownStore.getState();
    const badgeCount = filterCount();
    this.title.onclick = selectedPoint ? () => {} : this.titleHandler.bind(this);
    this.countBadge.className = createClasses("decidimGeo__filterDropdown__counter", [
      badgeCount === 0 && "hidden"
    ]);
    this.countBadge.textContent = badgeCount;
    this.title.className = createClasses("decidimGeo__filterDropdown__title", [
      "button",
      this.isOpen() && "active"
    ]);
    this.titleContainer.className = createClasses(
      "decidimGeo__filterDropdown__titleContainer",
      [(selectedPoint || isScopeOpen) && "disabled"]
    );

    this.dropdown.className = createClasses("decidimGeo__filterDropdown__dropdown", [
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
}

export default FilterDropdown;
