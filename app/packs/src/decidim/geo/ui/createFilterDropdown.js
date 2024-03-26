import createClasses from "./createClasses";
import dropdownFilterStore from "../models/dropdownFilterStore";
import geoStore from "../models/geoStore";
import configStore from "../models/configStore";
import filterStore from "../models/filterStore";
import pointStore from "../models/pointStore";
class FilterDropdown {
  constructor(parent, anchor) {
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
      createClasses("decidimGeo__filterDropdown__title", [this.isOpen() && "active"]),
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
      anchor
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
    this.resetBtn.textContent = "Reset";
    this.resetBtn.onclick = () => {
      const { resetFilters } = filterStore.getState();
      const {
        resetFilters: resetDropdownFilter,
        toggleOpen,
        defaultFilters
      } = dropdownFilterStore.getState();
      resetDropdownFilter();
      // resetFilters();
      this.applyValues(defaultFilters);
      toggleOpen();
    };
    this.applyBtn = L.DomUtil.create(
      "button",
      "decidimGeo__filterDropdown__applyBtn",
      this.dropdown
    );
    this.applyBtn.textContent = "Apply";

    this.applyBtn.onclick = () => {
      const { nextFilters, toggleOpen, applyNextFilters } =
        dropdownFilterStore.getState();
      this.applyValues(nextFilters);
      applyNextFilters();
      toggleOpen();
      this.repaint();
    };

    this.title.textContent = this.i18n()["decidim_geo.filters.button"];
    this.title.onclick = () => {
      this.toggle();
      this.repaint();
    };

    dropdownFilterStore.subscribe(
      (state) => [state.isOpen],
      () => this.repaint()
    );
    filterStore.subscribe(
      (state) => [state.activeFilters],
      () => {
        this.repaint();
      }
    );
  }

  defaultFilterFor(name) {
    const { toFilterOptions, defaultFilters } = filterStore.getState();
    return toFilterOptions(name, defaultFilters);
  }
  field(label, name, options, disabledOptions=[]) {
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
      if(disabledOptions.includes(value)) {
        option.disabled="disabled"
      }
      option.textContent = key;
    });
    return selectTag;
  }

  applyValues(filters) {
    if (!filters) {
      throw new Error("Filters missing");
    }
    const { setFilters, activeFilters, defaultFilters } = filterStore.getState();
    const newFilters = activeFilters.filter((filter) => {
      const [filterName] = Object.keys(filter);
      return !["resourceTypeFilter", "timeFilter", "geoencodedFilter"].includes(
        filterName
      );
    });
    switch (filters.GeoShowFilter || defaultFilters.GeoShowFilter) {
      case "all":
        break;
      case "only_geoencoded":
        newFilters.push({
          geoencodedFilter: { geoencoded: true }
        });
        break;
      case "only_virtual":
        newFilters.push({
          geoencodedFilter: { geoencoded: false }
        });
        break;
    }
    switch (filters.GeoTimeFilter || defaultFilters.GeoTimeFilter) {
      case "all":
        newFilters.push({
          timeFilter: { time: "all" }
        });
        break;
      case "only_past":
        newFilters.push({
          timeFilter: { time: "past" }
        });
        break;
      case "only_active":
        newFilters.push({
          timeFilter: { time: "active" }
        });
        break;
      case "only_future":
        newFilters.push({
          timeFilter: { time: "future" }
        });
        break;
    }

    switch (filters.GeoType || defaultFilters.GeoType) {
      case "all":
        newFilters.push({
          resourceTypeFilter: { resourceType: "all" }
        });
        break;
      case "only_processes":
        newFilters.push({
          resourceTypeFilter: { resourceType: "Decidim::ParticipatoryProcess" }
        });
        break;
      case "only_assemblies":
        newFilters.push({ resourceTypeFilter: { resourceType: "Decidim::Assembly" } });
        break;
      case "only_proposals":
        newFilters.push({
          resourceTypeFilter: { resourceType: "Decidim::Proposals::Proposal" }
        });
        break;
      case "only_meetings":
        newFilters.push({
          resourceTypeFilter: { resourceType: "Decidim::Meetings::Meeting" }
        });
        break;
    }
    setFilters(newFilters);
  }
  
  geoFields(points){
    const i18n = this.i18n();
    const i18nPrefix = "decidim_geo.filters";
    const hasGeoLocated = points.find((p) => p.isGeoLocated)
    const hasPhysical = points.find((p) => !p.isGeoLocated)

    return this.field(i18n[`${i18nPrefix}.geo.label`], "GeoShowFilter", [
      [i18n[`${i18nPrefix}.geo.all`], "all"],
      [i18n[`${i18nPrefix}.geo.only_geoencoded`], "only_geoencoded"],
      [i18n[`${i18nPrefix}.geo.only_virtual`], "only_virtual"]
    ], hasGeoLocated && hasPhysical ? [] : ["only_geoencoded", "only_virtual"]);
  }
  repaintOptions() {
    L.DomUtil.empty(this.dropDownOptions);
    const i18n = this.i18n();
    const i18nPrefix = "decidim_geo.filters"
    const {points} = pointStore.getState();
    this.geoFields(points);
    this.field(i18n[`${i18nPrefix}.time.label`], "GeoTimeFilter", [
      [i18n[`${i18nPrefix}.time.all`], "all"],
      [i18n[`${i18nPrefix}.time.only_past`], "only_past"],
      [i18n[`${i18nPrefix}.time.only_active`], "only_active"],
      [i18n[`${i18nPrefix}.time.only_future`], "only_future"]
    ]);
    this.typeFields(points);

  }

  typeFields(points) {
    const i18n = this.i18n();
    const i18nPrefix = "decidim_geo.filters";
    const hasMeetings = points.find((p) => p.type === "Decidim::Meetings::Meeting")
    const hasProposals = points.find((p) => p.type === "Decidim::Proposals::Proposal")
    const hasAssemblies = points.find((p) => p.type === "Decidim::Assembly")
    const hasProcesses = points.find((p) => p.type === "Decidim::ParticipatoryProcess")

    const disabledOptions = [];
    if(!hasMeetings)
      disabledOptions.push("only_meetings")
    if(!hasProposals)
      disabledOptions.push("only_proposals")
    if(!hasAssemblies)
      disabledOptions.push("only_assemblies")
    if(!hasProcesses)
      disabledOptions.push("only_processes")
    this.field(i18n[`${i18nPrefix}.type.label`], "GeoType", [
      [i18n[`${i18nPrefix}.type.all`], "all"],
      [i18n[`${i18nPrefix}.type.only_processes`], "only_processes"],
      [i18n[`${i18nPrefix}.type.only_assemblies`], "only_assemblies"],
      [i18n[`${i18nPrefix}.type.only_proposals`], "only_proposals"],
      [i18n[`${i18nPrefix}.type.only_meetings`], "only_meetings"]
    ], disabledOptions);
  }

  repaint() {
    const { selectedPoint } = geoStore.getState();
    const { filterCount } = dropdownFilterStore.getState();
    const badgeCount = filterCount();
    this.title.onclick = selectedPoint
      ? () => {}
      : () => {
          this.toggle();
          this.repaint();
        };
    this.countBadge.className = createClasses("decidimGeo__filterDropdown__counter", [
      badgeCount === 0 && "hidden"
    ]);
    this.countBadge.textContent = badgeCount;
    this.title.className = createClasses("decidimGeo__filterDropdown__title", [
      this.isOpen() && "active"
    ]);
    this.titleContainer.className = createClasses(
      "decidimGeo__filterDropdown__titleContainer",
      [selectedPoint && "disabled"]
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

const createFilterDropdown = (parent, anchor) => new FilterDropdown(parent, anchor);
export default createFilterDropdown;
