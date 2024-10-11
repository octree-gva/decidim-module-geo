import createClasses from "./createClasses";
import dropdownFilterStore from "../stores/dropdownFilterStore";
import geoStore from "../stores/geoStore";
import configStore from "../stores/configStore";
import filterStore from "../stores/filterStore";
import pointStore from "../stores/pointStore";
import pointCounterStore from "../stores/pointCounterStore";
class FilterModal {
  constructor(parent) {
    this.container = L.DomUtil.create(
      "div",
      "decidimGeo__filterModal__container",
      parent
    );
    this.applyDisabled = true;
    this.form = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__filterModal__form", [!this.isOpen() && "closed"]),
      this.container
    );
    this.fieldset = L.DomUtil.create(
      "ul",
      "decidimGeo__filterModal__fieldset",
      this.form
    );
    this.helptext = L.DomUtil.create("div", "decidimGeo__filterModalHelpText", this.form);

    this.actions = L.DomUtil.create("div", "decidimGeo__filterModal__actions", this.form);
    this.resetBtn = L.DomUtil.create(
      "button",
      "decidimGeo__filterModal__resetBtn",
      this.actions
    );
    this.resetBtn.innerHTML = `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_1419_471)">
          <path d="M12.1114 4.3585C14.2114 4.3585 16.2114 5.1585 17.7114 6.6585C20.8114 9.7585 20.8114 14.8585 17.7114 17.9585C15.9114 19.8585 13.4114 20.5585 11.0114 20.2585L11.5114 18.2585C13.2114 18.4585 15.0114 17.8585 16.3114 16.5585C18.6114 14.2585 18.6114 10.4585 16.3114 8.0585C15.2114 6.9585 13.6114 6.3585 12.1114 6.3585V10.9585L7.11136 5.9585L12.1114 0.958496V4.3585ZM6.41136 17.9585C3.81136 15.3585 3.41136 11.3585 5.21136 8.2585L6.71136 9.7585C5.61136 11.9585 6.01136 14.7585 7.91136 16.5585C8.41136 17.0585 9.01136 17.4585 9.71136 17.7585L9.11136 19.7585C8.11136 19.3585 7.21136 18.7585 6.41136 17.9585Z" fill="currentColor"/>
          </g>
          <defs>
          <clipPath id="clip0_1419_471">
          <rect width="24" height="24" fill="white" transform="translate(0.111328 0.358398)"/>
          </clipPath>
          </defs>
        </svg>
        <span>${this.i18n()["decidim_geo.filters.reset_button"]}
        </span>
    `;
    this.resetBtn.onclick = this.resetBtnHandler.bind(this);
    this.applyBtn = L.DomUtil.create(
      "button",
      "decidimGeo__filterModal__applyBtn",
      this.actions
    );
    this.applyBtn.textContent = this.i18n()["decidim_geo.filters.apply_button"];
    this.applyBtn.onclick = this.applyBtnHandler.bind(this);
  }

  applyBtnHandler() {
    if (this.applyDisabled) return;
    const { nextFilters, toggleOpen, applyNextFilters } = dropdownFilterStore.getState();
    this.applyValues(nextFilters);
    applyNextFilters();
    toggleOpen();
  }

  resetBtnHandler() {
    const { resetFilters: resetDropdownFilter, defaultFilters } =
      dropdownFilterStore.getState();
    resetDropdownFilter();
    this.applyValues(defaultFilters);
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
      "decidimGeo__filterModal__field",
      this.fieldset
    );
    const labelTag = L.DomUtil.create(
      "label",
      "decidimGeo__filterModal__label",
      fieldGroup
    );
    labelTag.htmlFor = name;
    labelTag.textContent = label;

    const selectTag = L.DomUtil.create(
      "select",
      "decidimGeo__filterModal__select",
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
        "decidimGeo__filterModal__option",
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

    const { setFilters } = filterStore.getState();
    const { fromOptionsToFilters } = dropdownFilterStore.getState();
    setFilters(fromOptionsToFilters(filters));
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

    L.DomUtil.empty(this.fieldset);
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
    this.container.className = createClasses("decidimGeo__filterModal__container", [
      !this.isOpen() && "closed"
    ]);
    this.form.className = createClasses("decidimGeo__filterModal__form", [
      !this.isOpen() && "closed"
    ]);
    this.applyBtn.className = createClasses("decidimGeo__filterModal__applyBtn", [
      this.applyDisabled && "disabled"
    ]);
    this.applyBtn.disabled = this.applyDisabled;
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
    pointCounterStore.subscribe(
      (state) => [state.nextCount, state.isLoading],
      ([count]) => {
        const applyDisabled = count === 0;
        if (applyDisabled !== this.applyDisabled) {
          this.applyDisabled = applyDisabled;
          this.repaint();
        }
      }
    );
  }
}

export default FilterModal;
