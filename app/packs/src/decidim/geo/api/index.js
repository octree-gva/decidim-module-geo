const queries = require("./queries.js");
const { getDecidimData } = require("../utils");
const { default: getGeoJSON } = require("./getGeoJSON.js");

const makeQuery =
  queryName =>
  async (params = {}) => {
    const variables = { ...(params.variables || {}), locale: "en" };
    const queryParams = { ...params, variables };

    console.log(queryParams);

    const response = await getDecidimData(queries[queryName], queryParams);
    console.log(response);
    return response.data[queryName];
  };

export { getGeoJSON };
export const getParticipatoryProcesses = makeQuery("participatoryProcesses");
export const getGeoShapefiles = makeQuery("geoShapefiles");
export const getGeoConfig = makeQuery("geoConfig");
export const getGeoShapeData = makeQuery("geoShapeData");
export const getGeoScopes = makeQuery("geoScope");
