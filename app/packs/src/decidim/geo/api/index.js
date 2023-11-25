const queries = require("./queries.js");
const { getDecidimData } = require("../utils");
const { default: getGeoJSON } = require("./getGeoJSON.js");
const { CONFIG } = require("../constants");

const makeQuery =
  queryName =>
  async (params = {}) => {
    const variables = { ...(params.variables || {}), locale: CONFIG.locale,  };
    const queryParams = { ...params, variables };
    const response = await getDecidimData(queries[queryName], queryParams);
    
    return response.data[queryName];
  };

export { getGeoJSON };
const _getGeoDatasource = makeQuery("geoDatasource");
export const getGeoDatasource = async (params = {}) => {
  let results = []
  let page = await _getGeoDatasource(params)
  const {hasNextPage, endCursor} = page.pageInfo;
  delete page.pageInfo;
  results = results.concat(page.nodes);
  let hasMore = hasNextPage
  params.after = endCursor
  while(hasMore) {
    page = await _getGeoDatasource(params)
    const {endCursor} = page.pageInfo;
    delete page.pageInfo;
    results = results.concat(page.nodes);
    hasMore = params.after != endCursor;
    params.after=endCursor;
  }

  return {nodes: results, edges: page.edge}
}
export const getGeoConfig = makeQuery("geoConfig");
export const getGeoScopes = makeQuery("geoScope");
