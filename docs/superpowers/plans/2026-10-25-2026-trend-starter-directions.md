# 2026 Trend Starter Directions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six source-grounded 2026 starter directions that apply a safe visual bundle, explain the design principle and tradeoff, and link to further reading without changing the recipe schema.

**Architecture:** Extend the existing direction and reference catalogs, then keep filtering and safe application in the domain layer. Move duplicated direction-card markup into a DOM-free TypeScript renderer used by both suggested and explorer views. The Astro component remains the static shell, while `app.ts` owns events, focus, transient filters, and store updates.

**Tech Stack:** Astro 7.4, TypeScript 6, vanilla browser TypeScript, Tailwind CSS 4, daisyUI 5, Zod 4, Node test runner through Vite SSR, Playwright CLI.

**Spec:** `docs/superpowers/specs/2026-10-25-2026-trend-starter-directions-design.md`

## Global Constraints

- Keep `RecipeSchema` at version 2 and do not add recipe fields.
- Preserve Astro plus vanilla TypeScript; do not add a React island or dependency.
- Keep recommendations deterministic and local-only.
- A starter may apply only `styles`, `palette`, `font`, `fontWeight`, `fontItalic`, and `signatures`.
- Preserve the user's brief, purpose, aspect, custom aspects, exact text, text mode, concept detail, exclusions, cliché selection, target, pattern, language, edit fields, and Midjourney settings.
- Never describe Dribbble engagement as evidence of popularity or effectiveness.
- Use semantic daisyUI and project theme classes; do not hardcode UI colors.
- Reuse `StudioField`, `FieldInfo`, `StudioDisclosure`, and the current direction list semantics.
- External learning links must use descriptive text, `target="_blank"`, and `rel="noopener noreferrer"`.
- Before Astro or daisyUI implementation work, reread the applicable project skills and current Astro documentation required by `AGENTS.md`.

## Review Focus

- An unknown `sourceId` must fail a catalog-validation test instead of rendering an empty link. Covered in Task 1.
- Applying a starter repeatedly must clone palettes and signature arrays so one recipe cannot mutate catalog or later recipe state. Covered in Task 2.
- Every protected recipe field must survive starter application byte-for-byte. Covered in Task 2.
- The 2026-only filter must combine with all existing filters, produce a valid empty state, clear cleanly, and restore focus. Covered in Tasks 2 and 4.
- Legacy directions without educational metadata must render no empty badge, principle, tradeoff, disclosure, or source link. Covered in Task 3.

---

### Task 1: Add the learning-source catalog and six starter definitions

**Files:**

- Modify: `src/lib/prompt-studio/domain/references.ts:10-225`
- Modify: `src/lib/prompt-studio/domain/presets.ts:13-282`
- Modify: `scripts/test-prompt-discovery.mjs:1-130`

**Interfaces:**

- Produces: `ReferenceKind` with a `"learning"` member.
- Produces: `getReference(id: string): ReferenceDef | undefined`.
- Produces: optional `Direction` fields `trendYear?: 2026`, `principle?: string`, `tradeoff?: string`, and `sourceIds?: readonly string[]`.
- Produces: six new `Direction` records in `PRESETS` with IDs `raw-human-voice`, `one-loud-detail`, `chromatic-pulse`, `soft-surreal-tactility`, `local-cut-paper-story`, and `retro-future-grid`.

- [ ] **Step 1: Write failing catalog-validation tests**

Extend `scripts/test-prompt-discovery.mjs` to load `references.ts` and assert:

```js
test("2026 starters have complete valid educational metadata", () => {
  const starters = data.DIRECTIONS.filter(
    ({ trendYear }) => trendYear === 2026,
  );
  assert.deepEqual(
    starters.map(({ id }) => id),
    [
      "raw-human-voice",
      "one-loud-detail",
      "chromatic-pulse",
      "soft-surreal-tactility",
      "local-cut-paper-story",
      "retro-future-grid",
    ],
  );
  assert.ok(starters.every(({ principle, tradeoff }) => principle && tradeoff));
  assert.ok(
    starters.every(({ sourceIds }) =>
      sourceIds?.every((sourceId) => references.getReference(sourceId)),
    ),
  );
});
```

Add assertions that every starter has valid style, format, goal, font, signature, three-color palette, and unique source IDs. Add a failure-focused assertion using a copied direction with `sourceIds: ["missing"]` against a small validation helper local to the test.

- [ ] **Step 2: Run the discovery test and verify it fails**

Run: `./scripts/with-node.sh pnpm test:discovery`

Expected: FAIL because no 2026 starters or `getReference` exist.

- [ ] **Step 3: Add the seven learning references**

In `references.ts`:

- Add `"learning"` to `ReferenceKind` and map it to `Design learning` in `KIND_LABELS`.
- Add `const RESEARCH_CHECKED = "2026-10-25"`; do not change the existing `CHECKED` date for older sources.
- Add records with IDs `figma-web-trends-2026`, `adobe-design-trends-2026`, `adobe-creative-trends-2026`, `behance-design-trends-2026`, `dribbble-design-trends`, `figma-typography`, and `cooper-how-posters-work`.
- Use `kind: "learning"` for Figma, Adobe, and Cooper Hewitt; use `kind: "community"` for Behance and Dribbble.
- Describe Dribbble as a visual reference gallery and explicitly state that engagement counts are not research evidence.
- Add `getReference(id: string): ReferenceDef | undefined` backed by a module-level map.

- [ ] **Step 4: Extend `Direction` and add the six exact starter bundles**

Use group `Contemporary 2026` and the formats, goals, principles, tradeoffs, and sources from the approved spec. Use these bundle values:

| ID                       | Styles                                       | Palette                                                               | Font            | Weight    | Signatures              | Rank | Source IDs                                               |
| ------------------------ | -------------------------------------------- | --------------------------------------------------------------------- | --------------- | --------- | ----------------------- | ---: | -------------------------------------------------------- |
| `raw-human-voice`        | `editorial`, `dada-collage`, `halftone`      | newsprint `#F1E8D5`, carbon `#1B1B1B`, tomato ink `#D9472B`           | `style`         | `bold`    | `variation`, `material` |  1.5 | `adobe-design-trends-2026`, `behance-design-trends-2026` |
| `one-loud-detail`        | `japanese-minimal`, `pop-art`, `mono-accent` | warm white `#F3F0E8`, cobalt `#3157D5`, black `#161616`               | `archivo-black` | `bold`    | `restraint`             |  2.5 | `behance-design-trends-2026`, `figma-web-trends-2026`    |
| `chromatic-pulse`        | `memphis`, `op-art`, `screenprint`           | peach `#FBE7CF`, hot pink `#FF5AA8`, teal `#139AA4`                   | `bebas`         | `bold`    | `concept`               |  3.5 | `figma-web-trends-2026`, `behance-design-trends-2026`    |
| `soft-surreal-tactility` | `polish-poster`, `surrealism`, `letterpress` | chalk `#E8E2D2`, charcoal `#1E1E1E`, red `#C9302C`                    | `style`         | `regular` | `concept`, `material`   |  4.5 | `adobe-creative-trends-2026`, `adobe-design-trends-2026` |
| `local-cut-paper-story`  | `editorial`, `cut-paper`, `risograph`        | paper `#F2EEE8`, terracotta `#C75B3A`, cobalt `#315C8C`               | `fraunces`      | `bold`    | `material`, `variation` |  5.5 | `adobe-creative-trends-2026`, `adobe-design-trends-2026` |
| `retro-future-grid`      | `swiss`, `op-art`, `clean`                   | off-white `#F1F1EC`, electric blue `#2A52D8`, signal orange `#F05A30` | `plex-mono`     | `bold`    | `concept`, `restraint`  |  6.5 | `figma-web-trends-2026`, `dribbble-design-trends`        |

Set `fontItalic: false` on all six. Write goal-specific rationale strings that connect the approved principle to each supported goal. Do not use the bare phrase "2026 style" in prompt-affecting fields.

- [ ] **Step 5: Run the catalog tests**

Run: `./scripts/with-node.sh pnpm test:discovery`

Expected: PASS.

- [ ] **Step 6: Run the type check**

Run: `./scripts/with-node.sh pnpm check`

Expected: PASS with no Astro or TypeScript errors.

- [ ] **Step 7: Commit the catalog work**

```bash
git add src/lib/prompt-studio/domain/references.ts src/lib/prompt-studio/domain/presets.ts scripts/test-prompt-discovery.mjs
git commit -m "feat: add 2026 trend starter catalog"
```

### Task 2: Implement safe bundle application and trend filtering

**Files:**

- Modify: `src/lib/prompt-studio/domain/discovery.ts:50-57,120-175,229-235`
- Modify: `scripts/test-prompt-discovery.mjs:30-130`

**Interfaces:**

- Consumes: `Direction.trendYear` and allow-listed values in `Direction.patch` from Task 1.
- Produces: `DirectionFilters.trendYear?: 2026 | "all"`.
- Produces: `applyDirection(current: Recipe, direction: Direction): Recipe` that applies and clones only safe bundle fields.

- [ ] **Step 1: Write failing safe-application and filter tests**

Add tests with a current recipe whose protected fields all differ from defaults. Assert that applying `raw-human-voice` changes exactly `styles`, `palette`, `font`, `fontWeight`, `fontItalic`, and `signatures`. Assert deep equality for every protected field listed in Global Constraints.

Also assert:

```js
assert.notEqual(next.palette, starter.patch.palette);
assert.notEqual(next.signatures, starter.patch.signatures);
assert.deepEqual(
  api
    .filterDirections(data.DIRECTIONS, { trendYear: 2026 })
    .map(({ trendYear }) => trendYear),
  Array(6).fill(2026),
);
```

Add a combined-filter case using `trendYear`, query, format, goal, style, and `curatedOnly`, plus a zero-result combination. Retain the existing legacy-direction preservation test and extend it to show that unspecified font and signatures remain unchanged.

Add recommendation assertions that the first four results for `poster` plus `attention` and for `social` plus `atmosphere` each include at least one direction with `trendYear === 2026`. This prevents the new starters from existing only in the explorer.

- [ ] **Step 2: Run the test and verify it fails**

Run: `./scripts/with-node.sh pnpm test:discovery`

Expected: FAIL because `trendYear` is ignored and starter fields are not applied.

- [ ] **Step 3: Add `trendYear` filtering**

Add `trendYear?: 2026 | "all"` to `DirectionFilters`. In `filterDirections`, require exact equality when the value is `2026`; treat `undefined` and `"all"` as no filter. Include `principle`, `tradeoff`, and resolved source names in `directionSearchText` so educational terms can be found.

- [ ] **Step 4: Implement the safe allow-list in `applyDirection`**

Use signature:

```ts
export function applyDirection(current: Recipe, direction: Direction): Recipe;
```

Always replace `styles`. Use the starter palette when supplied; otherwise derive the design palette as today. Clone palette colors and signatures. Replace `font`, `fontWeight`, `fontItalic`, and `signatures` only when the patch supplies them. Do not spread the rest of `direction.patch` into the recipe.

- [ ] **Step 5: Run domain tests**

Run: `./scripts/with-node.sh pnpm test:discovery`

Expected: PASS.

- [ ] **Step 6: Run the type check**

Run: `./scripts/with-node.sh pnpm check`

Expected: PASS.

- [ ] **Step 7: Commit the domain behavior**

```bash
git add src/lib/prompt-studio/domain/discovery.ts scripts/test-prompt-discovery.mjs
git commit -m "feat: apply safe starter bundles"
```

### Task 3: Extract and test the shared direction-card renderer

**Files:**

- Create: `src/lib/prompt-studio/ui/directions.ts`
- Modify: `scripts/test-prompt-discovery.mjs:1-160`

**Interfaces:**

- Consumes: `Direction`, `GoalId`, `getReference`, style definitions, and existing proof-SVG helpers.
- Produces: `DirectionCardVariant = "suggested" | "explorer"`.
- Produces: `RenderDirectionCardOptions` with `variant`, `goal`, and `selected`.
- Produces: `renderDirectionCard(direction: Direction, options: RenderDirectionCardOptions): string`.

- [ ] **Step 1: Write failing renderer tests**

Load `ui/directions.ts` with Vite SSR and assert that a suggested 2026 starter contains:

- `2026 starter`
- its principle and tradeoff as visible text
- all three layer names
- a descriptive `Learn with {source name}` link
- `target="_blank"` and `rel="noopener noreferrer"`
- `Use this starter`
- `aria-pressed="true"` when selected

Assert that the explorer variant uses a native `<details>` block for learning content and the same `data-preset` ID. Assert that a legacy direction contains `Use this direction` and omits every empty educational element and the 2026 badge.

- [ ] **Step 2: Run the test and verify it fails**

Run: `./scripts/with-node.sh pnpm test:discovery`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the DOM-free renderer**

Create the exact interfaces above. Keep HTML escaping private to the module. Resolve the first valid `sourceId` for the primary learning link. The suggested variant builds the existing proof thumbnail and complete card; the explorer variant builds the compact row with a native `<details class="direction-learning">` only when educational metadata exists.

Use the starter-supplied palette for its proof thumbnail before falling back to the design style palette. Keep `role="listitem"`, the three-layer list label, and current button classes so existing event delegation continues to work.

- [ ] **Step 4: Run renderer tests**

Run: `./scripts/with-node.sh pnpm test:discovery`

Expected: PASS.

- [ ] **Step 5: Run the type check**

Run: `./scripts/with-node.sh pnpm check`

Expected: PASS.

- [ ] **Step 6: Commit the renderer**

```bash
git add src/lib/prompt-studio/ui/directions.ts scripts/test-prompt-discovery.mjs
git commit -m "refactor: share direction card rendering"
```

### Task 4: Wire starter cards and the 2026 filter into the composer

**Files:**

- Modify: `src/layouts/components/PromptStudio.astro:177-260`
- Modify: `src/lib/prompt-studio/ui/app.ts:449-761`
- Modify: `src/lib/prompt-studio/ui/styles.css:646-860,2740-2790`

**Interfaces:**

- Consumes: `renderDirectionCard` from Task 3.
- Consumes: `DirectionFilters.trendYear` and safe `applyDirection` from Task 2.
- Produces: checkbox `#direction-2026`, active-filter key `trendYear`, and the rendered user flow specified in the design.

- [ ] **Step 1: Capture the failing browser baseline**

Start the app with `./scripts/with-node.sh pnpm dev`, then use the configured Playwright CLI to open and go to `http://localhost:4321/`. Capture a DOM snapshot proving that `2026 starters only`, `2026 starter`, and `Learn with` are absent before the UI work.

- [ ] **Step 2: Add the static filter control**

In the explorer filter panel, add a daisyUI checkbox with ID `direction-2026` and visible label `2026 starters only` next to the current curated-only control. Keep both controls keyboard reachable and associated with explicit labels.

- [ ] **Step 3: Replace duplicate card templates with the renderer**

Import `renderDirectionCard` into `app.ts`. Replace the suggested-card template with `renderDirectionCard(direction, { variant: "suggested", goal: view.goal, selected: view.presetId === direction.id })`. Replace the explorer result template with the `"explorer"` variant, passing the selected or primary group goal.

Remove imports used only by the old card templates. Preserve existing grouping, pagination, event delegation, and focus restoration.

- [ ] **Step 4: Wire the trend filter and reset behavior**

Read `#direction-2026` as an `HTMLInputElement`. Pass `trendYear: trendOnly.checked ? 2026 : "all"` to `filterDirections`. Add an active-filter pill labeled `Edition: 2026 starters`. Include the checkbox in change listeners, empty-state reset, per-filter removal, clear-all, and focus restoration.

Update explorer status text to append ` · 2026 starters` only while the filter is active. The filter must combine with curated-only instead of replacing it.

- [ ] **Step 5: Update application feedback**

Keep the current undo behavior. For a 2026 starter, announce `Applied “{name}” visual starter. Your content and output settings are unchanged.` For a legacy direction, retain the current direction wording.

- [ ] **Step 6: Add responsive and educational-card styles**

Style the badge, principle, tradeoff, source link, and compact learning disclosure using existing theme variables. Preserve the two-column direction grid at desktop and the existing single-column breakpoint. Keep principle and tradeoff visible in suggested cards, keep the action aligned at the bottom, and ensure the compact disclosure does not force the apply button off-screen at 390px width.

- [ ] **Step 7: Verify the full browser flow**

With Playwright CLI at desktop width:

- confirm at least one 2026 badge appears for common poster recommendations
- apply a starter and confirm the brief, headline, aspect, target, and prompt shape remain unchanged
- confirm the proof, layer labels, palette, type, and creative intent update
- use Undo and confirm the whole recipe returns
- open Explore all directions, enable 2026-only, and confirm six results across pagination or one complete page
- combine the filter with an impossible query and confirm the empty state
- clear the filter pill and confirm focus returns to `#direction-2026`
- open a compact learning disclosure and inspect the descriptive external link

Resize to 390 by 844 and repeat the card, filter, disclosure, and apply checks. Run `console` and expect no errors or warnings introduced by the feature. Stop the dev server after verification.

- [ ] **Step 8: Run the discovery tests**

Run: `./scripts/with-node.sh pnpm test:discovery`

Expected: PASS.

- [ ] **Step 9: Run the type check**

Run: `./scripts/with-node.sh pnpm check`

Expected: PASS.

- [ ] **Step 10: Commit the integrated UI**

```bash
git add src/layouts/components/PromptStudio.astro src/lib/prompt-studio/ui/app.ts src/lib/prompt-studio/ui/styles.css
git commit -m "feat: add 2026 starter direction flow"
```

### Task 5: Update product documentation and run final verification

**Files:**

- Modify: `PRODUCT.md:9-35`
- Modify: `docs/research/visual-prompt-recommendation-principles.md:1-55`

**Interfaces:**

- Consumes: the completed catalog and UI behavior from Tasks 1 through 4.
- Produces: durable product and research documentation matching the shipped behavior.

- [ ] **Step 1: Document the shipped capability**

Update `PRODUCT.md` to state that source-grounded contemporary starters can apply coordinated visual bundles while preserving user content and output settings. Keep the product copy local-first and copy-first; do not promise image generation or performance gains.

Update the research note with the 2026 sources, the distinction between editorial forecasts and evidence, and the rule that Dribbble is a visual index rather than a popularity signal.

- [ ] **Step 2: Run the formatting check**

Run: `./scripts/with-node.sh pnpm format:check`

Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `./scripts/with-node.sh pnpm lint`

Expected: PASS.

- [ ] **Step 4: Run the type check**

Run: `./scripts/with-node.sh pnpm check`

Expected: PASS.

- [ ] **Step 5: Run the discovery tests**

Run: `./scripts/with-node.sh pnpm test:discovery`

Expected: PASS.

- [ ] **Step 6: Run the production build**

Run: `./scripts/with-node.sh pnpm build`

Expected: production build completes and `validate:build` reports no broken internal links or generated-output failures.

- [ ] **Step 7: Check the final diff**

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 8: Inspect repository state**

Run: `git status --short`

Expected: only the intended feature files and the pre-existing untracked `tsconfig.tsbuildinfo` before the documentation commit.

- [ ] **Step 9: Commit documentation**

```bash
git add PRODUCT.md docs/research/visual-prompt-recommendation-principles.md
git commit -m "docs: explain 2026 starter direction sources"
```

- [ ] **Step 10: Request final code review**

Run the repository's completion review workflow against the approved design and this plan. Address only verified findings, rerun the affected checks, and report the final commit range and any remaining known limitations.
