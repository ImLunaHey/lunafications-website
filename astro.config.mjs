import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://lunafications.blue",
  server: { host: true, port: 4321 },
  adapter: cloudflare()
});