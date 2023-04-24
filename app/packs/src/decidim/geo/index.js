const { initMap, createScopesDropdown } = require("./ui");

async function main() {
  const map = await initMap();

  const scopesDropdown = await createScopesDropdown(map);
}

main();
