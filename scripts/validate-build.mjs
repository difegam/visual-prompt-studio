import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "node-html-parser";

const projectRoot = process.cwd();
const distRoot = path.join(projectRoot, "dist");
const config = JSON.parse(
  await readFile(path.join(projectRoot, "src/config/config.json"), "utf8"),
);
const siteMode = process.env.SITE_MODE;
const failures = [];

if (siteMode !== "preview" && siteMode !== "production") {
  console.error(
    "SITE_MODE must be preview or production. Run `pnpm run build` or `pnpm run build:preview`.",
  );
  process.exit(2);
}

const siteUrl = new URL(config.site.base_url);
const basePath = `/${(config.site.base_path || "/").replace(
  /^\/+|\/+$/g,
  "",
)}`.replace(/^\/$/, "");
const trailingSlash = config.site.trailing_slash;

function fail(file, message) {
  failures.push(`${path.relative(projectRoot, file)}: ${message}`);
}

async function findHtmlFiles(directory, files = []) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT" && directory === distRoot) {
      fail(directory, "dist/ does not exist; build the site first");
      return files;
    }
    throw error;
  }

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await findHtmlFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }

  return files;
}

function routeFromFile(file) {
  const relative = path.relative(distRoot, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404";
  if (relative.endsWith("/index.html")) {
    return `/${relative.slice(0, -"/index.html".length)}`;
  }
  return `/${relative.slice(0, -".html".length)}`;
}

function sitePathForRoute(route) {
  let pagePath = route;
  if (trailingSlash && pagePath !== "/" && !pagePath.endsWith("/")) {
    pagePath += "/";
  }
  return `${basePath}${pagePath}` || "/";
}

function expectedCanonical(route) {
  return new URL(sitePathForRoute(route), siteUrl.origin).toString();
}

function expectedSitemap() {
  const sitemapPath = `${basePath}/sitemap-index.xml`;
  return new URL(sitemapPath, siteUrl.origin).toString();
}

const htmlFiles = await findHtmlFiles(distRoot);
const pagesByPath = new Map();

for (const file of htmlFiles) {
  const page = parse(await readFile(file, "utf8"));
  const route = routeFromFile(file);
  const expectedUrl = expectedCanonical(route);
  const canonicals = page.querySelectorAll('link[rel="canonical"]');

  if (canonicals.length !== 1) {
    fail(file, `expected one canonical link, found ${canonicals.length}`);
  } else {
    const href = canonicals[0].getAttribute("href");
    try {
      const actual = new URL(href);
      if (actual.href !== expectedUrl) {
        fail(file, `canonical ${actual.href} should be ${expectedUrl}`);
      }
    } catch {
      fail(file, `canonical href is missing or invalid: ${href || "(empty)"}`);
    }
  }

  for (const image of page.querySelectorAll("img")) {
    if (!image.hasAttribute("alt")) {
      fail(file, `image is missing an alt attribute: ${image.toString()}`);
    }
  }

  const robots = page
    .querySelector('meta[name="robots"]')
    ?.getAttribute("content");
  if (siteMode === "preview") {
    if (!robots?.toLowerCase().includes("noindex")) {
      fail(file, "preview page is missing a noindex robots directive");
    }
  } else if (route === "/" && robots?.toLowerCase().includes("noindex")) {
    fail(file, "production homepage inherited a preview noindex directive");
  }

  const pathname = new URL(expectedUrl).pathname;
  if (pagesByPath.has(pathname)) {
    fail(file, `duplicate generated route ${pathname}`);
  }
  pagesByPath.set(pathname, { file, page, route });
}

const requiredRoutes = ["/", "/blog", "/categories", "/tags", "/404"];
for (const route of requiredRoutes) {
  const expectedPath = new URL(expectedCanonical(route)).pathname;
  if (!pagesByPath.has(expectedPath)) {
    fail(distRoot, `required route ${route} was not generated`);
  }
}

const taxonomyRoutes = [
  { index: "/categories", prefix: "/categories/", label: "category" },
  { index: "/tags", prefix: "/tags/", label: "tag" },
];
const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

for (const taxonomy of taxonomyRoutes) {
  const indexPath = new URL(expectedCanonical(taxonomy.index)).pathname;
  const indexPage = pagesByPath.get(indexPath);
  if (!indexPage) continue;

  const links = indexPage.page
    .querySelectorAll("a[href]")
    .map((link) => ({
      href: link.getAttribute("href"),
      label: link.text.trim(),
    }))
    .filter((link) => {
      try {
        const pathname = new URL(link.href, siteUrl).pathname;
        return pathname.startsWith(`${basePath}${taxonomy.prefix}`);
      } catch {
        return false;
      }
    });

  if (links.length === 0) {
    fail(indexPage.file, `taxonomy index has no ${taxonomy.label} links`);
  }

  for (const link of links) {
    let pathname;
    try {
      pathname = new URL(link.href, siteUrl).pathname;
    } catch {
      fail(indexPage.file, `invalid ${taxonomy.label} link: ${link.href}`);
      continue;
    }

    let slug;
    try {
      slug = decodeURIComponent(
        pathname
          .slice(`${basePath}${taxonomy.prefix}`.length)
          .replace(/\/$/, ""),
      );
    } catch {
      fail(indexPage.file, `malformed ${taxonomy.label} URL: ${link.href}`);
      continue;
    }

    if (!validSlug.test(slug)) {
      fail(indexPage.file, `invalid ${taxonomy.label} slug in ${link.href}`);
    }
    if (!link.label) {
      fail(
        indexPage.file,
        `empty ${taxonomy.label} link label for ${link.href}`,
      );
    }
    if (!pagesByPath.has(pathname)) {
      fail(
        indexPage.file,
        `${taxonomy.label} route ${pathname} has no generated page`,
      );
    }
  }
}

const notFoundPath = path.join(distRoot, "404.html");
try {
  await readFile(notFoundPath);
} catch {
  fail(distRoot, "required 404.html output is missing");
}

const sitemapPath = path.join(distRoot, "sitemap-index.xml");
try {
  const sitemap = await readFile(sitemapPath, "utf8");
  if (!sitemap.includes("<loc>") || !sitemap.includes(siteUrl.origin)) {
    fail(sitemapPath, "sitemap index has no valid site URL entries");
  }
} catch {
  fail(distRoot, "required sitemap-index.xml output is missing");
}

const robotsPath = path.join(distRoot, "robots.txt");
try {
  const robots = (await readFile(robotsPath, "utf8"))
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean);

  if (siteMode === "preview") {
    if (!robots.includes("disallow: /") || robots.includes("allow: /")) {
      fail(robotsPath, "preview robots.txt must disallow all crawlers");
    }
  } else {
    if (!robots.includes("allow: /") || robots.includes("disallow: /")) {
      fail(robotsPath, "production robots.txt must allow public routes");
    }
    const sitemapDirective = robots.find((line) => line.startsWith("sitemap:"));
    if (sitemapDirective !== `sitemap: ${expectedSitemap()}`) {
      fail(
        robotsPath,
        "production robots.txt must point to the configured sitemap",
      );
    }
  }
} catch {
  fail(distRoot, "required robots.txt output is missing");
}

if (failures.length > 0) {
  console.error(`Build validation failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(
    `Build validation passed (${siteMode}): ${htmlFiles.length} HTML pages, canonical URLs, image alt attributes, taxonomies, 404, sitemap, and robots.txt.`,
  );
}
