import config from "@/config/config.json";
import { getSiteMode, getSitemapUrl } from "@/lib/seo";

export const prerender = true;

export function GET() {
  const body =
    getSiteMode() === "preview"
      ? "User-agent: *\nDisallow: /\n"
      : [
          "User-agent: *",
          "Allow: /",
          "Disallow: /api/*",
          `Sitemap: ${getSitemapUrl(config.site.base_url, config.site.base_path)}`,
          "",
        ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
