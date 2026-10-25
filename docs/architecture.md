# Architecture

Visual Prompt Studio is a static [Astro](https://astro.build) site (Astro 7, React 19, Tailwind CSS 4, daisyUI 5, strict TypeScript). Astro owns routing, layouts and metadata. The composer is a typed, browser-side TypeScript module.

## Layers

```
src/pages/index.astro                 page shell for the Studio
src/pages/compare.astro               before/after comparison of generic and studio prompts
src/layouts/components/PromptStudio.astro   markup for the composer
src/lib/prompt-studio/ui/             browser behavior (DOM, events, storage)
src/lib/prompt-studio/domain/         pure data and logic, no DOM
```

The domain layer has no DOM, randomness or I/O, so the node tests load it directly.

## Domain (`src/lib/prompt-studio/domain/`)

| File                                   | Role                                                                                                                                                                                                                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `recipe.ts`                            | The `Recipe` type and Zod schema, formats, aspect ratios, `TARGETS`, `PATTERNS`, `PATTERNS_BY_TARGET`, authorial intents                                                                                                                                                |
| `compiler.ts`                          | `Recipe` to `CompiledPrompt`. Every output piece is a `Segment` tagged with its source, so the UI can show which input produced which words. Also returns notices, skipped exclusions, a negative prompt (where the target has one) and an undirected comparison prompt |
| `styles.ts`                            | The 29-entry style catalog and its three layers                                                                                                                                                                                                                         |
| `presets.ts`                           | The 16 directions (including the six 2026 starters), `getDirection`, and layer mixes                                                                                                                                                                                    |
| `discovery.ts`                         | Goals, recommendation, filtering, pagination and `applyDirection`                                                                                                                                                                                                       |
| `palettes.ts`, `fonts.ts`, `avoids.ts` | Palettes, typefaces, exclusions and clichés                                                                                                                                                                                                                             |
| `references.ts`                        | The inspiration and source registry, learning topics and `filterReferences`                                                                                                                                                                                             |
| `trends.ts`                            | Starter editions (year, label, direction IDs) and the current edition. An editorial designation, not popularity evidence                                                                                                                                                |
| `readability.ts`                       | Optional advice about legibility risks in the current recipe                                                                                                                                                                                                            |
| `open-in.ts`                           | "Open in" links for ChatGPT, Gemini, Midjourney and FLUX                                                                                                                                                                                                                |

## UI (`src/lib/prompt-studio/ui/`)

- `app.ts`: wires the DOM to the domain layer, owns state, persistence and import/export
- `directions.ts`: direction cards
- `direction-comparison.ts`: the side-by-side comparison of two directions and its selection helper
- `escape.ts`: the shared HTML escaping helper
- `sketch.ts`: the vector proof sheet
- `info-popover.ts`, `target-logos.ts`, `styles.css`, `fonts.css`

## Compare page

`src/pages/compare.astro` shows before/after sliders for a generic prompt against a studio prompt. Its cases live in `src/lib/prompt-studio/compare-cases.ts` and its images in `src/assets/compare/`.

## Persistence

The recipe lives in `localStorage` under a versioned key. Reads, imports and writes pass through the Zod schema in `recipe.ts`. Data that fails validation is moved aside under an `.unreadable` key instead of being deleted.

## Site content

Blog posts, authors and the About page are Astro content collections in `src/content/`, validated by `src/content.config.ts`. Studio data (styles, palettes, fonts and the rest) is typed data in the domain layer, not content collections. See [content authoring](content-authoring.md).

## Build pipeline

`scripts/build.mjs` runs: theme generation, JSON (search index) generation, `astro check`, `astro build`, `llms` generation, then `validate-build`. See [getting started](getting-started.md).

## Tests

`pnpm test:discovery` runs `scripts/test-prompt-discovery.mjs` with the Node test runner. It starts Vite in middleware mode, loads the domain and UI modules through SSR, and covers discovery, directions, the compiler and target behavior.
