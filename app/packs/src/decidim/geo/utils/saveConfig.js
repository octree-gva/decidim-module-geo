import configStore from "../stores/configStore";
export default function saveConfig() {
  const mapElements = document.getElementsByClassName("js-decidimgeo");
  if (mapElements.length < 1) {
    console.warn("no map config for this page");
    return undefined;
  }
  const mapElement = mapElements[0];
  const configString = mapElement.getAttribute("data-config");
  const i18nConfigString = mapElement.getAttribute("data-i18n");
  const config = JSON.parse(configString);
  const i18nConfig = JSON.parse(i18nConfigString);
  const { setConfig } = configStore.getState();
  return setConfig({ ...config, mapID: mapElement.id, i18n: i18nConfig });
}
