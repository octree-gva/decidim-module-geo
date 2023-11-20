const { ROOT_URL } = require("../constants");

export async function getDecidimData(query, params) {
  const body = {
    query,
    ...params,
  };
  const now = `${+ new Date()}`
  console.log(`${now} | GRAPHQL | query: `, body)
  var result = await window
    .fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    .then(async response => {
      const res = await response.json();
      console.log(`${now} | GRAPHQL | response: `, res)
      if(res.errors) {
        throw new Error(JSON.stringify(res.errors))
      }
      return res;
    });

  if (result) {
    return result;
  }
  return [];
}

export function getConfig() {
  const mapElements = document.getElementsByClassName("js-decidimgeo");
  if (mapElements.length < 1) {
    console.log("no map config for this page");
    return undefined;
  }
  const mapElement = mapElements[0];

  const configString = mapElement.getAttribute("data-config");
  console.log(configString);
  return { ...JSON.parse(configString), mapID: mapElement.id };
}

export function getGeoI18n() {
  const mapElements = document.getElementsByClassName("js-decidimgeo");
  if (mapElements.length < 1) {
    console.log("no map config for this page");
    return undefined;
  }
  const mapElement = mapElements[0];

  const geo_i18nHash = mapElement.getAttribute("geo_i18n");
  console.log(geo_i18nHash);
  return { ...JSON.parse(geo_i18nHash), mapID: mapElement.id };
}

function paginateGraphQLObject(object, itemsPerPage, currentPage) {
  if (!object || !object.data || !object.data.geoDatasource) {
    console.log("Invalid GraphQL object.");
    return;
  }

  const nodes = object.data.geoDatasource.nodes;
  const totalNodes = nodes.length;

  // Calculate start and end index for the current page
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  // Extract nodes for the current page
  const nodesForPage = nodes.slice(start, end);

  // Check if there are more pages
  const hasNextPage = end < totalNodes;

  // Build the paginated response object
  const paginatedObject = {
    pageInfo: {
      hasNextPage: hasNextPage,
      hasPreviousPage: currentPage > 1,
      startCursor: start.toString(),
      endCursor: (end - 1).toString(),
    },
    nodes: nodesForPage,
  };

  return paginatedObject;
}
