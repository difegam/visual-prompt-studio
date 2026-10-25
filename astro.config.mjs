import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import remarkArticleMetrics from "./src/plugins/remarkArticleMetrics.mjs";
import sharp from "sharp";
import config from "./src/config/config.json";
import theme from "./src/config/theme.json";

// Helper to parse font strings from theme.json, e.g. "Heebo:wght@400;600".
function parseFontString(fontStr) {
  const [name, weightPart] = fontStr.split(":");
  const match = weightPart?.match(/wght@?([\d;]+)/);

  return {
    name: name.replace(/\+/g, " "),
    weights: match ? match[1].split(";").map(Number) : [400],
  };
}

const fontsConfig = Object.entries(theme.fonts.font_family)
  .filter(([key]) => !key.includes("_type"))
  .map(([key, fontString]) => {
    const { name, weights } = parseFontString(fontString);
    const fallback = theme.fonts.font_family[`${key}_type`] || "sans-serif";

    return {
      name,
      cssVariable: `--font-${key}`,
      provider: fontProviders.bunny(),
      weights,
      display: "swap",
      fallbacks: [fallback],
    };
  });

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url ? config.site.base_url : "http://examplesite.com",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: config.site.trailing_slash ? "always" : "never",
  image: { service: sharp() },
  vite: { plugins: [tailwindcss()] },
  fonts: fontsConfig,

  integrations: [react(), sitemap(), mdx()],

  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkArticleMetrics,
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
    }),
    shikiConfig: { theme: "one-dark-pro", wrap: true },
  },
});
