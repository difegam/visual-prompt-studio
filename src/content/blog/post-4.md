---
title: "Keep preview builds out of search results"
image: "/images/starter-post-preview-builds.jpg"
description: "A sample article about the starter's preview and production build modes."
date: 2026-10-23T09:00:00Z
categories: ["Deployment", "SEO"]
author: "Starter Team"
tags: ["Cloudflare", "preview"]
draft: false
---

Preview builds use `SITE_MODE=preview`. Every generated page receives a `noindex,nofollow` directive, and the generated `robots.txt` denies crawling. Production builds use `SITE_MODE=production`, the configured canonical origin, and the sitemap.

The build validator checks canonical URLs, image alt attributes, required routes, taxonomy links, sitemap output, and robots behavior. It helps catch configuration mistakes before deployment, but it cannot verify that a configured domain belongs to you.

Set `site.base_url` in `src/config/config.json` before building for production. Keep preview and production Workers separate when using the included Cloudflare workflow.
