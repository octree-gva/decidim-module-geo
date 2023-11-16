const { getConfig, getGeoI18n } = require("./utils");

export const CONTROLLED_INPUT_CLASS = "decidimGeo__customControl__input";
export const ROOT_URL = location.host;
export const CONFIG = getConfig();
export const GEOI18N = getGeoI18n();
