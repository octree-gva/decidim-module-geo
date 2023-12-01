const { GEOI18N } = require("../constants");

Decidim.config.config.messages.geo = GEOI18N

export default window.Decidim.config.get("messages")["geo"]
