import { _getGeoDataSource, _getGeoDataSourceIds } from "./queries";

const countGeoDataSource = async (params = {}, callback = undefined) => {
  const { filters = [], locale, isIndex = false, isGroup=false, after = 0, first = 50 } = params;
  const fields = [];

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
    const response = await fetch(
      "/api/decidim-geo/points/count?" + searchParams.toString()
    );
    if (response.ok) page = await response.json();
    else throw new Error(await response.text());
  } catch (error) {
    console.error(error);
    throw error;
  }
  if (!page) return;
  if (callback) callback(page.count);
  return page.count;
};
export default countGeoDataSource;
