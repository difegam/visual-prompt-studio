# Visual Prompt Studio

Visual Prompt Studio is a local-first, copy-first composer for art-directed image prompts. The homepage combines layout, imagery, print finish, palette, typography, exact poster text, and exclusions into prompts tuned for the selected image model. It does not generate images or send recipe data to a server.

The app is built on the Astro template in this repository. Astro owns routing, layouts, metadata, and the content pages; the interactive composer is a typed browser-side module. The original v2 source and guides are kept in `visual-prompt-studio 2/` as references.

## Run

Requirements: Node.js `22.23.4` or newer and pnpm `11.17.0`.

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

The composer saves its recipe in the browser, supports validated JSON import/export, and copies model-specific prompts. Inspiration links open external sites; the app itself makes no API calls.

## Prompt composer

- Select from nine aspect ratios, eight formats, five model targets, and target-appropriate prompt structures.
- Combine independent layout, imagery, and finish styles with palettes, type specimens, and optional authorial intent.
- Preserve exact poster copy or reserve a clean area for later typesetting.
- Select exclusions; style-dependent exclusions are called out and skipped automatically.
- Import and export typed recipes. The recipe schema also validates browser storage.

Run the repository checks and production build with the commands below. See [technology decisions](docs/technology-decisions.md), [content authoring](docs/content-authoring.md), and [deployment](docs/deployment.md) for the Astro template details.

## Included

- Astro 7, React 19, Tailwind CSS 4, daisyUI 5, and strict TypeScript.
- Blog, author, page, category, and tag routes backed by Astro content collections.
- Light/dark themes generated from `src/config/theme.json`.
- Search and the existing React MDX shortcodes.
- Original editorial illustrations for the homepage and sample articles; see the [visual asset guide](docs/visual-assets.md).
- Canonical URLs, sitemap, preview noindex handling, and build output validation.
- Cloudflare Workers Static Assets deployment workflows for `development` and `main`.
- A narrowly typed, optional portfolio example.

The starter keeps React because the search and MDX components already use it. Use Astro for static presentation and add hydration only where the browser needs interactive state. Svelte and Vite+ are not part of the baseline; see [technology decisions](docs/technology-decisions.md).

## Start here

Requirements: Node.js `22.23.4` or newer, using an Astro-supported even-numbered Node release, and pnpm `11.17.0`.

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

Run the repository quality checks:

```sh
pnpm run lint
pnpm run format:check
pnpm run check
```

`pnpm run check` refreshes the search index before running Astro's whole-project check. Lefthook installs Git hooks with the dependency setup; the pre-commit hook lints and formats staged files, and pre-push runs this same project check. CI repeats lint, format, type/content check, and builds. See [Git hooks](docs/git-hooks.md) for optional checks that fit other project types.

Build for a production domain or for a noindex preview:

```sh
pnpm run build          # production mode
pnpm run build:preview  # preview mode: noindex + deny-all robots.txt
```

The build also validates generated routes, canonicals, image alt attributes, taxonomy links, sitemap, and robots output. `pnpm run preview:cf-workers` builds and serves the development Worker locally. See [deployment](docs/deployment.md) before configuring a remote Worker.

## AI-assisted development

This starter includes project instructions and an Astro Docs MCP configuration for agents. See [AI-assisted development](docs/ai-assisted-development.md) for the recommended Astro and daisyUI references, repo-specific constraints, and a reusable task prompt.

## Customize before launch

1. Set your name, site title, canonical origin, description, and copyright in `src/config/config.json`; replace `public/social-card.svg` and `public/favicon.svg`.
2. Replace the sample homepage and about copy in `src/content/`; replace the example authors and posts or delete them.
3. Update navigation in `src/config/menu.json`, social links in `src/config/social.json`, and theme values in `src/config/theme.json`.
4. Connect the contact form to a real handler. The submit button stays disabled until `params.contact_form_action` is set.
5. Replace the draft privacy policy with wording for the services and data practices of the deployed site. It is excluded from builds while marked `draft: true`.
6. Configure Cloudflare and GitHub deployment environments if you want the included CI deployment workflow.

The inherited raster demo artwork has been removed. Use media that you have permission to publish, and write useful alt text for informative images. See [content authoring](docs/content-authoring.md) and [optional modules](docs/optional-modules.md).

## Reuse boundaries

Shared components should encode a real content contract, interaction, accessibility behavior, or repeated pattern. A generic wrapper around one heading and a slot is usually clearer as markup at its call site. The [component guide](docs/components.md) reviews which inherited components should remain specialized and how to remove the optional portfolio example.

## License and source

The code is MIT licensed. This starter retains the upstream license and attribution; see [LICENSE](LICENSE) and [upstream provenance](docs/UPSTREAM.md). Review third-party package licenses and any assets you add before distributing a derived site.
