const queries = require("./queries.js");
const { getDecidimData } = require("../utils");
const { default: getGeoJSON } = require("./getGeoJSON.js");
const { CONFIG } = require("../constants");

const makeQuery =
  queryName =>
  async (params = {}) => {
    const variables = { ...(params.variables || {}), locale: CONFIG.locale };
    const queryParams = { ...params, variables };
    const response = await getDecidimData(queries[queryName], queryParams);
    console.log(queries[queryName])
    return response.data[queryName];
  };

export { getGeoJSON };
export const getGeoDatasource = makeQuery("geoDatasource");
export const getGeoShapefiles = makeQuery("geoShapefiles");
export const getGeoConfig = makeQuery("geoConfig");
export const getGeoShapeData = makeQuery("geoShapeData");
export const getGeoScopes = makeQuery("geoScope");
