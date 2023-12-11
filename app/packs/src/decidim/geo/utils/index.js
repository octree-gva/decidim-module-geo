export { default as saveConfig } from "./saveConfig";
export async function getDecidimData(query, params) {
  const body = {
    query,
    ...params
  };
  const now = `${+new Date()}`;
  console.log(`${now} | GRAPHQL | query: `, body);
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
      console.log(`${now} | GRAPHQL | response: `, res);
      if (res.errors) {
        throw new Error(JSON.stringify(res.errors));
      }
      return res;
    });

  if (result) {
    return result;
  }
  return [];
}
