import { _getGeoDataSource, _getGeoDataSourceIds } from "./queries";

const getGeoDataSource = async (params = {}, fetchAll = true) => {
  let results = [];
  if (!params.variables) {
    params.variables = {};
  }
  const apiQuery = fetchAll ? _getGeoDataSource : _getGeoDataSourceIds;
  let page;
  try {
    page = await apiQuery(params);
  } catch (error) {
    console.error(error);
    throw error;
  }
  if (!page) return { nodes: [], edges: [] };
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
export default getGeoDataSource;
