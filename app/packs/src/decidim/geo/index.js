const { initMap, createScopesMenu } = require("./ui");

async function main() {
  const map = await initMap();

  const scopesMenu = await createScopesMenu(map);
}

main();
