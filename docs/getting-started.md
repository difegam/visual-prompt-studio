# Getting started

## Requirements

- Node.js from [`.nvmrc`](../.nvmrc) (22.23.4 or newer, an even-numbered release)
- pnpm 11.17.0 (`packageManager` in `package.json`)

## Run

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The dev server listens on <http://localhost:4321>. `pnpm dev` also watches the theme file and regenerates the search index before starting Astro.

## Scripts

| Script                              | What it does                                                           |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                          | Dev server with theme watch and search-index generation                |
| `pnpm lint`                         | ESLint over `src/`, `scripts/` and config files                        |
| `pnpm format` / `pnpm format:check` | Write or check Prettier formatting                                     |
| `pnpm check`                        | Regenerates the search index, then runs `astro check`                  |
| `pnpm test:discovery`               | Node test runner suite for the compiler, discovery and direction cards |
| `pnpm build`                        | Production build (`SITE_MODE=production`)                              |
| `pnpm build:preview`                | Same build with `noindex` and a deny-all `robots.txt`                  |
| `pnpm preview`                      | Serves an existing `dist/`                                             |
| `pnpm generate-llms`                | Writes `llms.txt`, `llms-full.txt` and per-page Markdown               |
| `pnpm validate:build`               | Validates the built output                                             |

## Build modes

`scripts/build.mjs` runs the theme generator, the JSON generator, `astro check`, `astro build`, the `llms` generator and `scripts/validate-build.mjs`. The validation covers routes, canonical URLs, image alt text, taxonomy links, the sitemap and `robots.txt`.

`SITE_MODE` selects the mode:

- `production`: canonical URLs and sitemap use the configured site URL.
- `preview`: every page gets `noindex,nofollow` and `robots.txt` denies all crawlers.

## Site configuration

Site, menu, theme and social settings live in `src/config/`. Set `base_url` in `src/config/config.json` to your public URL before a production build.

## Browser checks

Verify UI changes in a real browser. [AGENTS.md](../AGENTS.md) describes the `playwright-cli` workflow and the Chrome DevTools MCP for Lighthouse and accessibility audits.
