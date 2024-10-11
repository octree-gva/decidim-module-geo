import createClasses from "./createClasses";
import pointCounterStore from "../stores/pointCounterStore";
import configStore from "../stores/configStore";
class FilterModalHelpText {
  constructor(parent) {
    this.parent = parent;
    this.container = L.DomUtil.create(
      "div",
      createClasses("decidimGeo__filterModalHelpText__container"),
      parent
    );
    this.helpText = L.DomUtil.create(
      "span",
      createClasses("decidimGeo__filterModalHelpText__label", ["errors"]),
      this.container
    );

    this.resultCount = 0;
  }

  repaint() {
    this.container.className = createClasses(
      "decidimGeo__filterModalHelpText__container"
    );
    this.helpText.className = createClasses("decidimGeo__filterModalHelpText__label", [
      this.resultCount === 0 && "errors"
    ]);
    this.helpText.textContent = this.countText();
  }

  countText() {
    const i18n = this.i18n();

    if (this.isLoading) {
      return "";
    } else {
      if (this.resultCount === 0) {
        return i18n[`decidim_geo.filters.results.warn_empty`];
      } else {
        return i18n[
          `decidim_geo.filters.results.${this.resultCount === 1 ? "one" : "other"}`
        ].replaceAll("%count%", this.resultCount);
      }
    }
  }

  i18n() {
    return this.config().i18n;
  }

  config() {
    return configStore.getState();
  }

  onAdd(_map) {
    pointCounterStore.subscribe(
      (state) => [state.nextCount, state.isLoading],
      ([count]) => {
        const oldCount = this.resultCount;
        this.resultCount = count;
        if (oldCount !== this.resultCount) this.repaint();
      }
    );

    // First paint
    this.repaint();
  }
}

export default FilterModalHelpText;
