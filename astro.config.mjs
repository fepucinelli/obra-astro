import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://obra.xyz",
  output: "static",
  integrations: [
    vue(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
});
