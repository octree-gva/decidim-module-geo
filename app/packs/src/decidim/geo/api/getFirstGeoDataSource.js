import { _getGeoDataSource, _getGeoDataSourceIds } from "./queries";

export const getFirstGeoDataSource = async (params = {}, fetchComplete = true) => {
  if (!params.variables) {
    params.variables = {};
  }
  const apiQuery = fetchComplete ? _getGeoDataSource : _getGeoDataSourceIds;
  let page;
  try {
    page = await apiQuery(params);
  } catch (error) {
    console.error(error);
    throw error;
  }
  if (!page) return { nodes: [], hasMore: false, endCursor: "" };
  const { hasNextPage = false, endCursor = "" } = page?.pageInfo || {};
  return { nodes: page.nodes, hasMore: hasNextPage, after: endCursor };
};

export default getFirstGeoDataSource;
