# Task-first visual discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make contextual design recommendations the primary discovery path in Visual Prompt Studio, with flexible recipe and style exploration.

**Architecture:** Keep the Astro page and vanilla TypeScript app. Add static goal and discovery metadata beside the existing recipe and style catalogs, then keep matching, filtering, grouping, sorting, and pagination in pure domain helpers. The browser UI uses those helpers to recommend several directions and refine them through the existing composer.

**Tech Stack:** Astro 7, TypeScript, existing vanilla TypeScript UI, Tailwind CSS 4, daisyUI 5.

**Spec:** `docs/superpowers/specs/2026-10-25-task-first-visual-discovery-design.md`

**Research:** `docs/research/visual-prompt-recommendation-principles.md`

## Global constraints

- Preserve the local-first behavior. Do not add accounts, analytics, runtime network calls, or remote recommendation services.
- Keep recommendation and editorial curation data static, deterministic, and reviewable.
- Treat popularity as curated editorial order and label it so the UI does not imply usage counts.
- Keep the current recipe compiler, model-specific prompt output, storage format, and import/export compatibility.
- Keep Astro page structure and the vanilla TypeScript client app.
- Use daisyUI 5 classes for new form and card controls, and keep the UI responsive and keyboard accessible.
- Follow the Astro docs and `astro-template-guidance` references for component and style changes.

## Review focus

- A format with no exact recipe match still gets useful goal-based directions. Verify recommendation fallback ordering for each format and goal.
- An unmatched search does not leave stale direction cards visible. Verify the empty state and clear-search action.
- Changing format or goal refreshes recommendations without overwriting a user's current recipe until they choose a direction. Verify with a non-default recipe loaded.
- Combining text search and multiple filters preserves the intersection of selected criteria. Verify before paginating.
- Changing filters or search while on a later page resets to page one and keeps counts and controls in sync. Verify for both recipe and style catalogs.

---

### Task 1: Add discovery metadata and catalog helpers

**Files:**

- Create: `src/lib/prompt-studio/domain/discovery.ts`
- Create: `scripts/test-prompt-discovery.mjs`
- Modify: `src/lib/prompt-studio/domain/presets.ts`
- Modify: `src/lib/prompt-studio/domain/styles.ts`
- Modify: `src/lib/prompt-studio/domain/recipe.ts`
- Modify: `package.json`

**Interfaces:**

- `GoalId`: literal union for the authored goal catalog.
- `GOALS`: records with `id`, `label`, `description`, and the design principle each goal represents.
- `Direction`: a preset with `formats`, `goals`, `group`, `rationale`, and optional `curatedRank` metadata.
- `getRecommendations(format: PurposeId, goal: GoalId, limit?: number): readonly Direction[]`: exact matches first, then same-goal or same-format fallbacks, with deterministic curated ordering.
- `applyDirection(current: Recipe, direction: Direction): Recipe`: apply the direction's style layers and palette while preserving user-entered brief text, format, aspect, target, language, and pattern.
- `filterDirections(directions: readonly Direction[], filters: DirectionFilters): readonly Direction[]`: combines search, format, goal, and style matching.
- `filterStyles(styles: readonly StyleDef[], filters: StyleFilters): readonly StyleDef[]`: combines search, group, and curated status.
- `paginateItems<T>(items: readonly T[], page: number, pageSize: number): Page<T>`: clamps page bounds and returns page items, current page, page count, and total.

- [ ] Write `scripts/test-prompt-discovery.mjs` with real-code assertions for exact recommendation matches, format/goal fallback without duplicate recipes, combined search filters, pagination bounds, and `applyDirection` preserving user text/settings.
- [ ] Run `node --test scripts/test-prompt-discovery.mjs`. Expected: FAIL because the discovery module and exports do not exist.
- [ ] Define five initial goals in `discovery.ts`: `attention`, `story`, `explain`, `atmosphere`, and `bold`, with concise user-facing labels and guidance.
- [ ] Extend every current preset with relevant format and goal tags, a discovery group, a rationale, and curated rank only for editorially selected starters. Cover all current `PURPOSES` values; add a recipe only when no useful direction exists.
- [ ] Add curated tags and searchable keywords for style entries without changing prompt fragments or compiler behavior.
- [ ] Implement `getRecommendations`, `applyDirection`, combined filters, and generic pagination in `discovery.ts`.
- [ ] Add a `test:discovery` package script that runs the Node built-in test runner.
- [ ] Run `pnpm test:discovery`. Expected: PASS for all five discovery behaviors.
- [ ] Run `pnpm check` and resolve type errors in the new catalog types and existing consumers.
- [ ] Inspect current mappings against every format and goal. Confirm each has at least one recommendation and the fallback never returns duplicate directions.

### Task 2: Put explained recommendations at the start of discovery

**Files:**

- Modify: `src/layouts/components/PromptStudio.astro`
- Modify: `src/lib/prompt-studio/ui/app.ts`
- Modify: `src/lib/prompt-studio/ui/styles.css`

**Interfaces:**

- Consumes `GOALS`, `getRecommendations`, `applyDirection`, and `Direction` from Task 1.
- Produces a goal picker and recommendation cards that display direction name, style layers, rationale, and a select action.

- [ ] Add a communication-goal control near the existing format field. Do not change format or goal when the user types in the brief.
- [ ] Replace the unfiltered quick-start strip with an initial set of explained directions based on selected format and goal; show several distinct options, not one automatic selection.
- [ ] Wire direction selection to `applyDirection` so it updates the composer only on explicit selection, preserves the user's brief and output settings, and keeps the selected direction's layers editable.
- [ ] Preserve the active recipe when the format or goal changes; refresh suggestions without applying them.
- [ ] Add clear rationale copy that explains the visual effect of the recipe and why it fits the chosen goal.
- [ ] Run `pnpm check`, then use the local preview to verify goal switching, recommendation choice, existing preset application, and editing a recommended layer.

### Task 3: Add recipe search, filters, groups, curated picks, and pagination

**Files:**

- Modify: `src/layouts/components/PromptStudio.astro`
- Modify: `src/lib/prompt-studio/ui/app.ts`
- Modify: `src/lib/prompt-studio/ui/styles.css`

**Interfaces:**

- Uses `filterDirections`, `paginateItems`, `DirectionFilters`, and `Direction` from Task 1.
- Exposes an in-composer "Explore all directions" browser grouped by format or goal.

- [ ] Add search across recipe name, summary, goal labels, format labels, and selected style names.
- [ ] Add combinable format and goal filters and a grouping control for project format or communication goal.
- [ ] Add an editorial "Curated pick" label and curated ordering. Include nearby copy that these are studio selections, not usage counts.
- [ ] Add pagination over the filtered result set. Reset to page one when query or filters change, and preserve filters when the user changes page.
- [ ] Add an empty state with a clear-search action and an accurate result count.
- [ ] Run `pnpm check`, then verify search, combined filters, group switching, curated ordering, empty state, page bounds, and selection in the local preview.

### Task 4: Make the three style catalogs searchable and browsable

**Files:**

- Modify: `src/layouts/components/PromptStudio.astro`
- Modify: `src/lib/prompt-studio/ui/app.ts`
- Modify: `src/lib/prompt-studio/ui/styles.css`

**Interfaces:**

- Uses `filterStyles`, `paginateItems`, and `StyleFilters` from Task 1.
- Adds independent search, filters, group labels, curated markers, and pagination to the existing design, art, and technique panels.

- [ ] Add a search field per active style layer. Match name, era, summary, and authored keywords.
- [ ] Add appropriate group filters for the layer and a curated option for selected starting styles. Do not reuse font popularity as a style popularity signal.
- [ ] Paginate after filtering. Keep the selected style visible and selected even if it is outside the current result page; clear filters or switch pages to see it.
- [ ] Add empty states and accessible names/status for search, filters, result counts, and pagination.
- [ ] Run `pnpm check`, then verify selection, search, filter intersections, pagination, and the selected-style state on desktop and mobile preview widths.

### Task 5: Check the finished discovery flow

**Files:**

- Modify as needed: `src/layouts/components/PromptStudio.astro`
- Modify as needed: `src/lib/prompt-studio/ui/app.ts`
- Modify as needed: `src/lib/prompt-studio/ui/styles.css`

- [ ] Run `pnpm check` and `pnpm build`.
- [ ] Use the production preview to walk through a poster and book-cover brief, choose a communication goal, compare multiple directions, apply one, edit each style layer, and copy the prompt.
- [ ] Verify recipe import/export and the stored recipe still work after discovery changes.
- [ ] Confirm there are no new external requests, that popular labels describe editorial curation, and that the composer remains keyboard operable at narrow and wide viewport sizes.
- [ ] Review the final diff, avoiding unrelated changes already present in the working tree.
