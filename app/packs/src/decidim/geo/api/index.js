import * as queries from "./queries";
import { getDecidimData } from "../utils";
import getGeoJSON from "./getGeoJSON";
import configStore from "../models/configStore";

const makeQuery =
  (queryName, responseKey = undefined) =>
  async (params = {}) => {
    const _responseKey = responseKey ? responseKey : queryName;
    const { locale } = configStore.getState();
    const variables = { ...(params.variables || {}), locale: locale };
    const queryParams = { ...params, variables };
    const response = await getDecidimData(queries[queryName], queryParams);
    return response.data[_responseKey];
  };

export { getGeoJSON };
const _getGeoDatasource = makeQuery("geoDatasource");
const _getGeoDatasourceIds = makeQuery("geoDatasourceIds", "geoDatasource");

export const getGeoDatasource = async (params = {}, fetchAll = true) => {
  let results = [];
  if (!params.variables) {
    params.variables = {};
  }
  const apiQuery = fetchAll ? _getGeoDatasource : _getGeoDatasourceIds;
  let page;
  try {
    page = await apiQuery(params);
  } catch (error) {
    console.error(error);
    throw error;
  }
  if (!page) return [];
  const { hasNextPage = false, endCursor = "" } = page?.pageInfo || {};
  results = results.concat(page.nodes);
  let hasMore = hasNextPage;
  params.variables.after = endCursor;
  while (hasMore) {
    try {
      page = await apiQuery(params);
    } catch (error) {
      console.error(error);
      return { nodes: results, edges: page.edge };
    }
    const { endCursor = params.variables.after, hasNextPage } = page.pageInfo || {};
    results = results.concat(page.nodes);
    hasMore = hasNextPage;
    params.variables.after = endCursor;
  }

  return { nodes: results, edges: page.edge };
};
export const getGeoConfig = makeQuery("geoConfig");
export const getGeoScopes = makeQuery("geoScope");
