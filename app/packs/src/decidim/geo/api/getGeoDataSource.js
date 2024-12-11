import { _getGeoDataSource, _getGeoDataSourceIds } from "./queries";

const getGeoDataSource = async (params = {}, fetchAll = true, callback) => {
  const { filters = [], locale, isIndex = false, isGroup=false, after = 0, first = 50 } = params;
  const fields = fetchAll
    ? [
        "resourceUrl",
        "resourceId",
        "resourceType",
        "resourceStatus",
        "participatorySpaceId",
        "participatorySpaceType",
        "componentId",
        "startDate",
        "endDate",
        "title",
        "shortDescription",
        "descriptionHtml",
        "imageUrl",
        "latitude",
        "longitude",
        "geoScopeId",
        "lonlat",
        "extendedData"
      ]
    : ["resourceType"];

  const searchParams = new URLSearchParams({
    locale,
    after,
    first
  });
  if(isIndex){
    searchParams.append("is_index", "true")
  }
  if(isGroup){
    searchParams.append("is_group", "true")
  }
  filters.forEach((f) => {
    searchParams.append("filters[]", JSON.stringify(f));
  });
  fields.forEach((f) => searchParams.append("fields[]", f));
  let page;
  try {
    const response = await fetch("/api/decidim-geo/points?" + searchParams.toString());
    if (response.ok) page = await response.json();
    else throw new Error(await response.text());
  } catch (error) {
    console.error(error);
    throw error;
  }
  if (!page) return { nodes: [], edges: [] };
  const { has_more: hasMoreThanOne, end_cursor: endCursor } = page?.meta || {};
  callback(page.data, hasMoreThanOne, page?.meta || {});
  if (!hasMoreThanOne) return;

  searchParams.set("after", endCursor);
  while (true) {
    try {
      const response = await fetch("/api/decidim-geo/points?" + searchParams.toString());
      if (response.ok) page = await response.json();
      else throw new Error(await response.text());
    } catch (error) {
      console.error(error);
      return;
    }
    const { end_cursor: endCursor, has_more: hasMore } = page.meta || {};
    callback(page.data, hasMore, page?.meta || {});
    if (!hasMore) break;
    searchParams.set("after", endCursor);
  }
};
export default getGeoDataSource;
