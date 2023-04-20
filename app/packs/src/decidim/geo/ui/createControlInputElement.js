const { CONTROLLED_INPUT_CLASS } = require("../constants");

const createControlInputElement = ({ group, label, changeEventHandler }) => {
  //prevent leaflet css override
  const control = L.DomUtil.create("div");
  const container = L.DomUtil.create(
    "div",
    `decidimGeo__customControl__${group ? "child" : "parent"}`,
    control
  );
  const item = L.DomUtil.create("label", "", container);

  const input = L.DomUtil.create("input", CONTROLLED_INPUT_CLASS, item);
  input.type = "checkbox";
  input.checked = false;
  L.DomEvent.disableClickPropagation(input);
  input.addEventListener("change", changeEventHandler);

  const labelElement = L.DomUtil.create("span", "", item);
  labelElement.textContent += " " + label;

  return control;
};

export default createControlInputElement;
