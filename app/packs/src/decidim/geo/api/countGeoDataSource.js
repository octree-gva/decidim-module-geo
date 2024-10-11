import { _getGeoDataSource, _getGeoDataSourceIds } from "./queries";

const countGeoDataSource = async (params = {}, callback = undefined) => {
  const { filters = [], locale, isIndex = false, after = 0, first = 50 } = params;
  const fields = [];

  const searchParams = new URLSearchParams({
    locale,
    is_index: isIndex,
    after,
    first
  });
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
