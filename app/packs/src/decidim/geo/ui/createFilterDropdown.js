import createClasses from "./createClasses";
import dropdownFilterStore from "../models/dropdownFilterStore";
import geoStore from "../models/geoStore";
import configStore from "../models/configStore";
import filterStore from "../models/filterStore";
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
        selectedFilters
      } = dropdownFilterStore.getState();
      resetFilters();
      resetDropdownFilter();
      this.applyValues(selectedFilters);
      toggleOpen();
    };
    this.applyBtn = L.DomUtil.create(
      "button",
      "decidimGeo__filterDropdown__applyBtn",
      this.dropdown
    );
    this.applyBtn.textContent = "Apply";

    this.applyBtn.onclick = () => {
      const { selectedFilters, toggleOpen } = dropdownFilterStore.getState();
      this.applyValues(selectedFilters);
      toggleOpen();
      this.repaint();
    };

    this.title.textContent = this.i18n()["filters.button"] || "Filters";
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

  field(label, name, options) {
    const { selectedFilters } = dropdownFilterStore.getState();
    const selectedValue = selectedFilters[name] || this.defaultFilterFor(name);
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
      dropdownFilterStore.getState().setFilter(name, evt.target.value);
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
      option.textContent = key;
    });
    return selectTag;
  }

  applyValues(filters) {
    const { setFilters, activeFilters } = filterStore.getState();
    const newFilters = activeFilters.filter((filter) => {
      const [filterName] = Object.keys(filter);
      return !["resourceTypeFilter"].includes(filterName);
    });
    switch (filters.GeoShowFilter || "all") {
      case "all":
        break;
      case "only_geoencoded":
        break;
      case "only_virtual":
        break;
    }
    switch (filters.GeoTimeFilter || "all") {
      case "all":
        break;
      case "only_past":
        break;
      case "only_active":
        break;
      case "only_future":
        break;
    }

    switch (filters.GeoType || "all") {
      case "all":
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

  repaintOptions() {
    L.DomUtil.empty(this.dropDownOptions);
    this.field("Show", "GeoShowFilter", [
      ["All", "all"],
      ["Mapped activity only", "only_geoencoded"],
      ["Other activity only", "only_virtual"]
    ]);
    this.field("Filter By Time", "GeoTimeFilter", [
      ["All", "all"],
      ["Past", "only_past"],
      ["Active", "only_active"],
      ["Future", "only_future"]
    ]);
    this.field("Filter By Type", "GeoType", [
      ["All", "all"],
      ["Processes", "only_processes"],
      ["Assemblies", "only_assemblies"],
      ["Proposals", "only_proposals"],
      ["Meetings", "only_meetings"]
    ]);
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
