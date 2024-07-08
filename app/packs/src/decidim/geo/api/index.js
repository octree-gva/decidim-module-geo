import * as queries from "./queries";
import { getDecidimData } from "../utils";
import configStore from "../models/configStore";

const makeQuery =
  (queryName, responseKey = undefined) =>
  async (params = {}) => {
    const _responseKey = responseKey ? responseKey : queryName;
    const { locale, defaultLocale } = configStore.getState();
    const variables = { ...(params.variables || {}), locale, defaultLocale };
    const queryParams = { ...params, variables };
    const response = await getDecidimData(queries[queryName], queryParams);
    if(!response?.data) return {nodes: []};
    return response.data[_responseKey];
  };

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
  if (!page) return {nodes: [], edges: []};
  const { hasNextPage = false, endCursor = "" } = page?.pageInfo || {};
  results = results.concat(page.nodes);
  let hasMore = hasNextPage;
  params.variables.after = endCursor;
  while (hasMore) {
    try {
      page = await apiQuery(params);
    } catch (error) {
      console.error(error);
      return { nodes: results };
    }
    const { endCursor = params.variables.after, hasNextPage } = page.pageInfo || {};
    results = results.concat(page.nodes);
    hasMore = hasNextPage;
    params.variables.after = endCursor;
  }

  return { nodes: results };
};
export const getFirstGeoDatasource = async (params = {}, fetchAll = true) => {
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
  if (!page) return {nodes: [], hasMore: false, endCursor: ""};
  const { hasNextPage = false, endCursor = "" } = page?.pageInfo || {};
  return {nodes: page.nodes, hasMore: hasNextPage, after: endCursor};
};
export const getGeoConfig = makeQuery("geoConfig");
export const getGeoScopes = makeQuery("geoScope");
