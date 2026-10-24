# Content authoring

## Where content lives

| Content                     | Location                                                       | Route or use                                            |
| --------------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| Blog posts                  | `src/content/blog/*.md` or `*.mdx`                             | `/blog/{entry-id}` plus category, tag, and author pages |
| Author profiles             | `src/content/authors/*.md`                                     | `/authors/{entry-id}`                                   |
| General pages               | `src/content/pages/*.md` or `*.mdx`                            | `/{entry-id}`                                           |
| About and contact page data | `src/content/about/-index.md`, `src/content/contact/-index.md` | `/about`, `/contact`                                    |
| Homepage sections           | `src/content/homepage/-index.md`, `src/content/sections/*.md`  | Rendered on `/`                                         |

Entries beginning with `-` are collection data and are not published as single routes. The `-index.md` files provide content for fixed pages or sections.

## Blog frontmatter

The blog collection schema is in `src/content.config.ts`. A typical entry looks like this:

```yaml
---
title: "A useful article title"
description: "A concise summary for cards and search results."
date: 2026-10-24T09:00:00Z
author: "Example Author"
categories: ["Guides"]
tags: ["astro"]
draft: true
---
```

Use an author title that matches a record in `src/content/authors/`. Keep categories and tags concise and stable; they create linked pages. Set `draft: true` until an article is ready. Future-dated posts stay out of ordinary builds until their date arrives. Set `draft: false` or remove the field to publish.

Markdown is enough for most articles. Use MDX only when prose needs one of the registered shortcodes (`Button`, `Accordion`, `Notice`, `Video`, `Youtube`, `Tabs`, `Tab`). Avoid embedding interactive components where a link or standard HTML element works.

## Images and accessibility

The inherited raster demo artwork was removed because the upstream project did not grant redistribution rights for those images. Put new public assets in `public/images` and reference them with a site path such as `/images/diagram.webp`. For imported `src/assets` images in components, use Astro's `Image` component.

The `starter-*` illustrations in `public/images` are coordinated examples for the homepage and sample articles. Replace or remove them when adding a site's own visual material. See the [visual asset guide](visual-assets.md) for their locations and roles. No author portraits or testimonial images are supplied, so example content does not imply that fictional people or endorsements are real.

Write alt text that conveys the image's purpose. Use `alt=""` for decorative images. Do not use a filename, generic “image” text, or nearby heading as a substitute for meaningful alt text. The build validator checks that each generated `img` has an `alt` attribute; it cannot judge whether the text is useful.

## Drafts, checks, and builds

Draft blog posts and general pages with `draft: true` are excluded from ordinary builds. Do not put secrets, private client data, unpublished personal details, or content that must remain confidential in the repository: a draft is still committed source.

After editing content, run:

```sh
pnpm run check
pnpm run build:preview
```

`pnpm run check` creates the search index before Astro's whole-project content and type diagnostics. Build scripts run the output validator. `SITE_MODE=preview` adds `noindex,nofollow` to pages and blocks crawlers in `robots.txt`; it is not access control. Production canonical URLs and sitemap entries use `site.base_url` and `site.base_path` from `src/config/config.json`.

Blog article word count and reading time are derived during Markdown rendering. They are intentionally not copied into frontmatter or collection schemas. Code blocks and inline code are excluded from those estimates.

## Legal, forms, and publishing

`src/content/pages/privacy-policy.md` is a draft and does not appear in ordinary builds. Write a policy that accurately describes the deployed site and its services before changing `draft` to `false`.

The contact page's example submit button remains disabled until `params.contact_form_action` is set in `src/config/config.json`. Connect a real endpoint and verify its data handling before enabling it. The site does not include a contact backend.
