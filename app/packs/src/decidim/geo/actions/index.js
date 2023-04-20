export const displayNestedLayers = (leafletContainer, checked) => {
  if (
    leafletContainer.classList.contains(CONTROLLED_INPUT_CLASS) &&
    leafletContainer.checked !== checked
  ) {
    leafletContainer.dispatchEvent(
      new MouseEvent("click", {
        view: window,
        bubbles: false,
        cancelable: false,
      })
    );
    //leafletContainer.checked = checked;
    //This leads layers to unsynchronize with the input state.
    // Bubbling the click seems to ensure leaflet events are correctly triggered.
  }

  if (leafletContainer.children) {
    return [...leafletContainer.children].map(child =>
      displayNestedLayers(child, checked)
    );
  } else {
    return;
  }
};
