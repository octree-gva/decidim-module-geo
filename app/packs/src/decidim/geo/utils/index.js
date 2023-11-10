const { ROOT_URL } = require("../constants");

export async function getDecidimData(query, params) {
  var result = await window
    .fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        ...params,
      }),
    })
    .then(async response => {
      const res = await response.json();
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
