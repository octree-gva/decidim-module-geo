export { default as saveConfig } from "./saveConfig";
export async function getDecidimData(query, params) {
  const body = {
    query,
    ...params
  };
  var result = await window
    .fetch("/api", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    .then(async (response) => {
      const res = await response.json();
      if (res.errors) {
        throw new Error(JSON.stringify(res.errors));
      }
      return res;
    }).catch((e) => {
      console.log(`failed to fetch`, {body})
      console.error(e);
      return null;
    });

  if (result) {
    return result;
  }
  return [];
}
