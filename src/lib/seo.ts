export type SiteMode = "preview" | "production";

export function getSiteMode(): SiteMode {
  const configuredMode = process.env.SITE_MODE;

  if (
    configuredMode &&
    configuredMode !== "preview" &&
    configuredMode !== "production"
  ) {
    throw new Error("SITE_MODE must be either 'preview' or 'production'.");
  }

  if (configuredMode === "preview" || configuredMode === "production") {
    return configuredMode;
  }

  return process.env.NODE_ENV === "development" ? "preview" : "production";
}

export function getCanonicalUrl(
  path: string,
  siteUrl: string,
  basePath = "/",
  trailingSlash = false,
): string {
  const site = new URL(`${siteUrl.replace(/\/*$/, "")}/`);
  const canonicalUrl = new URL(path, site);

  // Astro.url.pathname may already include `base`; avoid adding it twice.
  // Explicit absolute canonical URLs are preserved as authored.
  const explicitAbsoluteUrl = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(path);
  if (!explicitAbsoluteUrl && canonicalUrl.origin === site.origin) {
    const normalizedBasePath = basePath.replace(/^\/+|\/+$/g, "");
    const base = normalizedBasePath ? `/${normalizedBasePath}` : "";
    const pathname = canonicalUrl.pathname;
    const hasBasePath =
      base && (pathname === base || pathname.startsWith(`${base}/`));
    let routePath = hasBasePath ? pathname.slice(base.length) || "/" : pathname;

    if (!routePath.startsWith("/")) routePath = `/${routePath}`;
    if (routePath === "/") {
      routePath = base ? `${base}/` : "/";
    } else if (trailingSlash) {
      routePath = `${base}${routePath.replace(/\/+$/, "")}/`;
    } else {
      routePath = `${base}${routePath.replace(/\/+$/, "")}`;
    }

    canonicalUrl.pathname = routePath;
  }

  canonicalUrl.search = "";
  canonicalUrl.hash = "";
  return canonicalUrl.toString();
}

export function getSitemapUrl(siteUrl: string, basePath: string): string {
  const normalizedBasePath = basePath.replace(/^\/*|\/*$/g, "");
  const sitemapPath = normalizedBasePath
    ? `/${normalizedBasePath}/sitemap-index.xml`
    : "/sitemap-index.xml";

  return new URL(sitemapPath, siteUrl).toString();
}
