const { ROOT_URL }  = require('../constants');

export async function getDecidimData(query, params) {
  var collection = await window
    .fetch(`${ROOT_URL}/api`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        ...params
      }),
    })
    .then(async response => {
      const res = await response.json();
      return res;
    })

  if (collection) {
    return collection;
  }
  return [];
}
