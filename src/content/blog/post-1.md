---
title: "Organize a content-first Astro site"
description: "A sample article showing how this starter organizes content and routes."
image: "/images/starter-post-content-models.jpg"
date: 2026-10-20T09:00:00Z
categories: ["Astro", "Content"]
author: "Example Author"
tags: ["content collections", "markdown"]
draft: false
---

Keep content in collections when it has a stable shape and needs to appear in more than one place. This starter uses collections for blog posts, author records, site pages, and homepage sections.

## Keep frontmatter useful

The blog schema defines the fields used by cards, author pages, category pages, and the post layout. A schema catches missing or mistyped data while the site is built. Avoid fields that only duplicate values the template can derive, such as a reading-time estimate.

Use `draft: true` for work that should stay out of normal builds. Set a publication date that reflects when the content should become visible.
