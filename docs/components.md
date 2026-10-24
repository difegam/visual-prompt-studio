# Components and reuse guidance

## Reuse rule

Keep Astro components focused on a real domain or behavior. Share a component when it has more than one consumer or provides a meaningful interaction, accessibility behavior, content transformation, or data contract. Use Tailwind and daisyUI classes for one-off layout and styling. Avoid generic `Card` and `Section` wrappers that only forward classes and slots.

## Existing Astroplate components

- `BlogCard.astro` is specific to Astro content entries in the blog collection. It renders the blog title, author, categories, date, summary, and route. Keep it tied to blog content rather than using it as a generic card.
- `AuthorCard.astro` is specific to author collection records.
- `Pagination.astro` is coupled to the current `/blog/page/` route scheme. Reuse it while that route contract remains in place.
- `ImageMod.astro` accepts paths under `public/images`. Keep it for content records stored there; new components that import images from `src/assets` should use Astro's `Image` component directly.
- `Breadcrumbs.astro` derives links from the current path and menu configuration. Keep it when routes follow those conventions.
- `ThemeSwitcher.astro` is the existing light/dark control. It stores the chosen value in local storage and sets `document.documentElement.dataset.theme`; Tailwind's `dark:` variant and daisyUI both read that attribute.
- `Share.astro` keeps social links available in static HTML and reveals native share or copy controls only where the browser supports them. Its status message uses a polite live region and its delegated click handler survives Astro page navigation.

`PostSingle.astro` owns the article metadata row and share placement. It gets `wordCount` and `readingTimeMinutes` from the shared remark pipeline; the metric plugin ignores fenced code, inline code, raw HTML, and MDX expressions. It does not add those generated values to validated collection frontmatter.

## What the local Astro projects contributed

The reviewed local projects provided patterns to evaluate, not code to transplant. Their licenses and notices are not consistent, so this starter implements selected behavior against Astroplate's own types and markup.

| Finding                                                                                                              | Decision                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reader-facing word count and reading time appeared in two local blogs.                                               | Added once to `PostSingle.astro` through the Markdown pipeline; prose is counted without copying derived values into frontmatter.                                            |
| A local share menu was large and duplicated behavior already owned by Astroplate's post layout.                      | Rebuilt `Share.astro` as a daisyUI `fab-flower`; social links are plain anchors that work without JavaScript, and the last button uses native share with clipboard fallback. |
| A local category cloud used the same categories already shown on taxonomy pages and the post sidebar.                | Added `CategoryFilter.astro` (pill row) to the blog list and category pages; the post sidebar was removed so there is a single category navigation.                          |
| A local portfolio used structured project data and a typed card.                                                     | Added an isolated `ProjectCard.astro` example with a small data contract; it is optional and separate from blog content.                                                     |
| Category tabs, tag multiselects, and a filter bar shared state through DOM attributes and global configuration.      | Excluded that coupling. Add a typed, page-specific filter only after a real filter interaction is required.                                                                  |
| Generic `PostGrid`, `Card`, and `Section` abstractions hid content-specific props or mostly forwarded slots/classes. | Kept blog and author cards specialized. Use Astro markup and utility classes for one-off sections.                                                                           |

Also left out project-specific map, localization, participant, event-animation, terminal, and session-overlay features. They add dependencies and domain assumptions without a reusable use case in this starter.

## Optional portfolio card

`ProjectCard.astro` is an opt-in example for a real project listing, not a generic card. It takes one `PortfolioProject` record from `src/examples/portfolio/projects.ts`:

```ts
import type { ImageMetadata } from "astro";

interface PortfolioProject {
  title: string;
  summary: string;
  href: string;
  tags?: readonly string[];
  image?: { src: ImageMetadata; alt: string };
}
```

Use a meaningful `alt` when an image conveys project content. Put local project images in `src/assets` and import them as `ImageMetadata` so Astro can optimize them. Remove `ProjectCard.astro`, `src/examples/portfolio/`, and `src/pages/examples/portfolio.astro` if the derived site has no portfolio.

## Taxonomy pages cover the category-cloud use case

The existing category and tag index pages already list content taxonomy values and link to static, crawlable category/tag pages. The post sidebar exposes categories and tags in context. A second category cloud would repeat the same data and navigation without adding behavior, so it is not part of this starter.

If a future site needs a compact horizontal cloud, keep it a page-level pattern with explicit data rather than adding a shared component for one consumer:

```ts
interface TaxonomyLink {
  slug: string;
  label: string;
  count: number;
}

interface TaxonomyCloudProps {
  items: readonly TaxonomyLink[];
  currentSlug?: string;
}
```

Render a normal list of links, include each count in the accessible name, and set `aria-current="page"` when `currentSlug` matches an item. Prefer real taxonomy routes for navigation. Add client-side filtering only when a page has a concrete filtering need; avoid coupling a `CategoryTabs`, `TagMultiSelect`, and `FilterBar` through hidden DOM attributes.

## React and MDX

Astro remains responsible for static presentation. React is retained for existing interactive components and the registered MDX shortcodes:

- `Button`
- `Accordion`
- `Notice`
- `Video`
- `Youtube`
- `Tabs`
- `Tab`

Their registrations live in `astro.config.mjs` through `astro-auto-import`. Keep a React component when its stateful behavior or existing MDX use justifies the framework runtime. For any newly hydrated component, choose the narrowest `client:*` directive that meets its interaction; do not use `client:only` if the component can render useful HTML on the server.
