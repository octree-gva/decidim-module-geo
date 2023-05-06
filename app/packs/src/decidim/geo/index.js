const { initMap, createScopesMenu } = require("./ui");
const { CONFIG } = require("./constants");

async function main() {
  const map = await initMap();

  const scopesMenu = await createScopesMenu(map);
}

main();
