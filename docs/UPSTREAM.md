# Upstream provenance

- Source: Astroplate by Zeon Studio (no remote is configured)
- License: MIT; the upstream `LICENSE` is retained.
- Astroplate version at import: `6.2.1`
- Imported: 2026-10-24
- Source branch: `main`
- Source commit: `501646d0fede2471105ef0cf3c2a154cbb814c4a`
- Clone: full history, 248 commits, not shallow.
- Working branch: `codex/curated-astroplate-starter`

The GitHub `main` history was checked on 2026-10-24 and still showed the imported commit as its latest entry. The local clone's `HEAD` matches that full hash. No upstream files were changed before the baseline dependency install, check, and build.

## Baseline

Environment: Node `v22.23.4`, pnpm `11.17.0`.

- `corepack pnpm install --frozen-lockfile`: passed; lockfile validated and 597 packages installed.
- `corepack pnpm run check`: initially failed because Astroplate's generated `.json/search.json` was absent. After `corepack pnpm run generate-json`, it passed with 0 errors, warnings, or hints. The run emits an existing deprecation warning for `markdown.remarkPlugins`, `markdown.rehypePlugins`, and `markdown.remarkRehype` in Astro configuration.
- `corepack pnpm run build`: passed; 28 routes built, then the existing LLM generator produced 27 page Markdown files plus `llms.txt` and `llms-full.txt`. The build emits the same Astro Markdown configuration deprecation warning.
- At the imported baseline, a sandboxed build could not fetch Google Fonts metadata and produced missing-font warnings; the authorized network build copied both configured fonts successfully. The curated fork now serves them through Bunny Fonts at runtime.

The first `check` result reflects the template's script-order requirement documented in `AGENTS.md`: its JSON generator must run before invoking Astro directly. The curated starter's `pnpm run check` now runs the generator first, so contributors can use that command from a fresh checkout.

## Curated fork

The current branch keeps the full upstream Git history and uses `501646d0fede2471105ef0cf3c2a154cbb814c4a` as the import point. The direct stack is Astro 7.4.2, React 19, Tailwind CSS 4 through `@tailwindcss/vite`, and daisyUI 5. Dependencies are pinned in `pnpm-lock.yaml`.

The fork adds build-mode SEO validation, article metrics, a progressive share control, Cloudflare Workers deployment workflows, and project docs. It also removes the inherited raster demo images: the upstream README says those images are demonstration-only and that redistribution rights were not granted. The replacement SVG placeholders in `public/` are original to this fork.

Local projects including `xmandanny` informed the review of reusable behavior. Their source code was not copied: the local repositories' license metadata and notices are inconsistent, so the new behavior was implemented against the upstream Astroplate source and its retained MIT license.
