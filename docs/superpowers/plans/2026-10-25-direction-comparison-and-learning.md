# Direction Comparison and Design Learning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users compare two visual directions before applying one, act on concise design advice, find learning sources by principle, and maintain yearly starter editions without changing persisted recipes.

**Architecture:** Keep Astro as the static shell and use the vanilla TypeScript app as the first interaction approach. Add focused pure modules for trend-edition metadata, readability rules, and comparison rendering/state, then connect them to the existing shared direction cards, filter summaries, native-dialog pattern, and reference carousel. All new state remains page-local; the recipe schema and compiler stay unchanged. A focused dependency is permitted only if the `AGENTS.md` evaluation shows a net maintainability, reliability, or security benefit.

**Tech Stack:** Astro 7.4, TypeScript 6, vanilla browser TypeScript, Tailwind CSS 4, daisyUI 5, Zod 4, Node test runner through Vite SSR, `node-html-parser`, Playwright CLI.

**Spec:** `docs/superpowers/specs/2026-10-25-direction-comparison-and-learning-design.md`

## Global Constraints

- Preserve Astro and start with vanilla TypeScript. Follow the `AGENTS.md` dependency policy before adding or replacing a package.
- Keep `RecipeSchema` at version 2 and do not persist comparison, topic-filter, readability, or trend-edition UI state.
- Apply direction bundles only through the existing allow-listed `applyDirection(current, direction)` contract.
- Keep the existing `Compare with an undirected prompt` control unchanged. Use the full label `Compare directions` for the new feature.
- Reuse `renderDirectionCard`, the current info-popover helper, `renderFilterSummary`, and the font-picker dialog pattern.
- Keep the uncommitted blank-first-run change in `src/lib/prompt-studio/ui/app.ts` intact. Placeholder examples must never count as recipe text.
- Use daisyUI components and semantic theme colors; do not hardcode UI colors.
- Before changing Astro markup or Studio styles, connect to the configured Astro docs MCP and read the relevant current guidance, then use `astro-template-guidance` for `component-usage.md` and `styling-and-theming.md`. Use the daisyUI skill for the dialog and controls.
- Keep external links descriptive and retain `target="_blank"` with `rel="noopener noreferrer"`.
- Keep all controls keyboard reachable, restore focus after rerenders and dialog closure, and support 390 by 844 pixels without horizontal scrolling.
- Keep source, direction, and trend data static, local, deterministic, and reviewable.

## Dependency decision gate

The planned implementation needs no new dependency: native `<dialog>`, page-local arrays, pure helpers, delegated DOM events, and the existing renderers cover the required behavior. Recheck this conclusion after Task 3, before integrating browser state in Task 4. If the vanilla implementation would require materially more custom state coordination, focus handling, or defensive code than planned, record a comparison of the no-dependency approach and the narrowest viable package using every factor in `AGENTS.md`. A dependency may replace the planned approach only when that comparison shows a clear net benefit; update this plan, `package.json`, and the lockfile before continuing.

## Review Focus

- A third comparison selection replaces the oldest selected direction, announces the replacement, and never leaves more than two selected IDs. Covered in Task 3.
- A compared direction hidden by filters or pagination remains selected; dialog closure falls back to a stable comparison control when its opener no longer exists. Covered in Task 4.
- Blank first-run text and placeholder examples produce neither comparison copy nor readability advice. Covered in Tasks 2 and 3.
- A hidden learning-topic filter cannot keep filtering after the user switches away from `Design learning`; kind and topic clear independently. Covered in Task 5.
- An unknown edition year or a catalog edition whose IDs do not match its directions fails validation instead of rendering a misleading badge or filter label. Covered in Task 1.

---

### Task 1: Generalize starter editions and add practical tips

**Files:**

- Create: `src/lib/prompt-studio/domain/trends.ts`
- Modify: `src/lib/prompt-studio/domain/presets.ts:24-499`
- Modify: `src/lib/prompt-studio/domain/discovery.ts:51-159`
- Modify: `src/lib/prompt-studio/ui/directions.ts:1-106`
- Modify: `scripts/test-prompt-discovery.mjs:1-230,285-345`

**Interfaces:**

- Produces: `TrendEdition`, `TREND_EDITIONS`, `CURRENT_TREND_EDITION`, and `getTrendEdition(year: number): TrendEdition | undefined` in `trends.ts`.
- Changes: `Direction.trendYear?: number` and adds `Direction.practiceTip?: string`.
- Changes: `DirectionFilters.trendYear?: number | "all"`.
- Consumes: `getTrendEdition` in the shared card renderer so starter badges use catalog data.

- [ ] **Step 1: Write failing edition and practice-tip tests**

Extend the Vite SSR setup to load `trends.ts`. Add tests named:

- `trend edition catalog matches the six 2026 starter IDs`
- `trend edition validation rejects unknown or mismatched direction IDs`
- `numeric edition filtering supports fixture years and all`
- `every 2026 starter has one practical next step`
- `direction cards derive their starter badge and tip from catalog metadata`
- `edition and practice metadata never enter recipes or compiled prompts`

Assert that `CURRENT_TREND_EDITION.year === 2026`, its six IDs exactly match the six catalog directions with `trendYear === 2026`, every tip is non-empty, a fixture direction with `trendYear: 2025` can be filtered independently, and legacy directions render no edition badge or empty tip markup. Apply a starter and compile it, then assert that its edition label and practical tip appear in neither the recipe JSON nor the compiled text.

Use a test-local `validateTrendCatalog(editions, directions)` helper for the failure tests. It must reject duplicate years, duplicate direction IDs within an edition, an edition ID that does not resolve, a direction whose `trendYear` has no edition, and a direction listed under a different year. Production code needs only the typed catalog and lookup function.

- [ ] **Step 2: Run the discovery test and verify it fails**

Run: `./scripts/with-node.sh pnpm test:discovery`

Expected: FAIL because `trends.ts`, numeric edition filtering, and `practiceTip` do not exist.

- [ ] **Step 3: Add the edition catalog**

Create these exact interfaces in `trends.ts`:

```ts
export interface TrendEdition {
  readonly year: number;
  readonly label: string;
  readonly description: string;
  readonly checked: string;
  readonly directionIds: readonly string[];
}

export const TREND_EDITIONS: readonly TrendEdition[];
export const CURRENT_TREND_EDITION: TrendEdition;
export function getTrendEdition(year: number): TrendEdition | undefined;
```

Seed only the 2026 edition. Use label `2026 starters`, checked date `2026-10-25`, the six approved starter IDs in catalog order, and a description that calls them source-grounded editorial directions rather than popularity evidence.

- [ ] **Step 4: Generalize direction and filter types**

Change `Direction.trendYear` and `DirectionFilters.trendYear` to accept numeric years. Update `filterDirections` to compare any supplied numeric year exactly while treating `undefined` and `"all"` as no edition filter. Keep recommendation ordering unchanged.

- [ ] **Step 5: Add the six practical tips**

Add these meanings as concise `practiceTip` values:

- `raw-human-voice`: keep the headline and one image as the first read; move supporting copy away from rough overlaps.
- `one-loud-detail`: exaggerate one element and let the remaining space stay quiet.
- `chromatic-pulse`: keep the headline short and separate it from the repeating pattern.
- `soft-surreal-tactility`: tie the impossible image to one concrete subject from the brief.
- `local-cut-paper-story`: name a real place, material, or object from the brief.
- `retro-future-grid`: give the central image or headline one specific idea so the grid does not feel generic.

- [ ] **Step 6: Make shared cards catalog-driven**

Use `getTrendEdition(direction.trendYear)` to render `${edition.year} starter`. Add the practical tip after principle and tradeoff inside the existing learning popover with the visible label `Try this:`. Do not render edition or tip markup when its data is missing or unresolved.

- [ ] **Step 7: Run the focused tests and type check**

Run:

```bash
./scripts/with-node.sh pnpm test:discovery
./scripts/with-node.sh pnpm check
```

Expected: all discovery tests pass and Astro reports zero errors.

- [ ] **Step 8: Commit the edition and tip model**

```bash
git add src/lib/prompt-studio/domain/trends.ts src/lib/prompt-studio/domain/presets.ts src/lib/prompt-studio/domain/discovery.ts src/lib/prompt-studio/ui/directions.ts scripts/test-prompt-discovery.mjs
git commit -m "feat: generalize starter editions"
```

### Task 2: Add narrow, testable readability advice

**Files:**

- Create: `src/lib/prompt-studio/domain/readability.ts`
- Modify: `scripts/test-prompt-discovery.mjs`

**Interfaces:**

- Produces: `ReadabilityHintTarget = "headline" | "text"`.
- Produces: `ReadabilityHint` with `id`, `priority`, `message`, `actionLabel`, and `target`.
- Produces: `getReadabilityHints(recipe: Recipe): readonly ReadabilityHint[]`, sorted by ascending priority.

- [ ] **Step 1: Write failing readability tests**

Load `readability.ts` through Vite SSR and add tests for:

```js
test("op-art exact text receives the highest-priority readability hint", () => {});
test("three supporting lines receive the dense-copy hint", () => {});
test("blank actual text and space-reservation mode receive no hints", () => {});
test("readability rules do not mutate or enter the recipe", () => {});
```

Use actual recipe values with surrounding whitespace. Assert that an `op-art` recipe with exact text returns `op-art-exact-text` first; three non-empty `extraText` entries return `dense-supporting-text`; two entries do not; `textMode: "space"` does not; and empty `headline` and `extraText` do not.

- [ ] **Step 2: Run the test and verify it fails**

Run: `./scripts/with-node.sh pnpm test:discovery`

Expected: FAIL because `readability.ts` does not exist.

- [ ] **Step 3: Implement the pure readability helper**

Use these exact messages and actions:

- `op-art-exact-text`, priority `10`: `Optical patterns can compete with exact text. Keep the copy short and separate it from repeated shapes.` Use `Review headline` and target `headline` when a headline exists; otherwise use `Review text` and target `text`.
- `dense-supporting-text`, priority `20`: `Three or more supporting lines can weaken the reading order. Choose one primary line and shorten the rest.` Use `Review text` and target `text`.

Trim only for rule evaluation. Do not rewrite the recipe or return placeholder text.

- [ ] **Step 4: Run tests and the type check**

Run:

```bash
./scripts/with-node.sh pnpm test:discovery
./scripts/with-node.sh pnpm check
```

Expected: PASS.

- [ ] **Step 5: Commit the readability rules**

```bash
git add src/lib/prompt-studio/domain/readability.ts scripts/test-prompt-discovery.mjs
git commit -m "feat: add prompt readability advice"
```

### Task 3: Build the pure direction-comparison renderer and selection model

**Files:**

- Create: `src/lib/prompt-studio/ui/direction-comparison.ts`
- Modify: `src/lib/prompt-studio/ui/directions.ts`
- Modify: `scripts/test-prompt-discovery.mjs`

**Interfaces:**

- Produces: `ComparisonSelectionResult = { ids: readonly string[]; replacedId?: string }`.
- Produces: `toggleComparisonSelection(current: readonly string[], directionId: string): ComparisonSelectionResult`.
- Produces: `renderComparisonBar(directions: readonly Direction[]): string`.
- Produces: `renderDirectionComparison(directions: readonly [Direction, Direction], recipe: Recipe): string`.
- Changes: `RenderDirectionCardOptions` gains `compared: boolean`.
- Produces card hook: `data-compare-direction="<direction-id>"` with an `aria-pressed` selected state.
- Produces bar hooks: `data-open-comparison` and `data-clear-comparison`.
- Produces dialog apply hook: existing `data-preset="<direction-id>"`.

- [ ] **Step 1: Write failing selection and rendering tests**

Load `direction-comparison.ts` through Vite SSR. Add tests asserting:

- toggling an unselected ID appends it; toggling a selected ID removes it;
- adding `c` to `[a, b]` returns `[b, c]` and `replacedId: "a"`;
- duplicate IDs and empty IDs never enter the result;
- one selected direction renders its name, `1 of 2 selected`, a disabled `Compare directions` button, and a clear action;
- two selected directions render an enabled `Compare directions` button;
- both card variants render `Add to comparison` with the right ID and `aria-pressed` value;
- comparison resolves each candidate through `applyDirection`, so a legacy direction keeps the current typeface while a starter uses its own typeface and palette;
- comparison output escapes catalog and recipe text and contains only actual non-empty headline/supporting text;
- comparison output contains two apply buttons, the principle, tradeoff, and `Try this` when present.

- [ ] **Step 2: Run the test and verify it fails**

Run: `./scripts/with-node.sh pnpm test:discovery`

Expected: FAIL because the comparison module and card option do not exist.

- [ ] **Step 3: Implement capped comparison selection**

Implement `toggleComparisonSelection` as a pure function with a maximum of two stable IDs. Removing an ID does not reorder the other selection. Adding a third drops the oldest ID and reports it in `replacedId` so `app.ts` can announce the replacement.

- [ ] **Step 4: Add comparison controls to the shared cards**

Extend both variants without duplicating card markup. Keep the existing primary apply button and add a secondary outline button with `data-compare-direction`, `aria-pressed`, and visible labels `Add to comparison` or `Selected for comparison`.

Update every existing `renderDirectionCard` test call to pass `compared: false` unless the test is checking selected comparison state.

- [ ] **Step 5: Implement the comparison bar and dialog content renderer**

Keep this module DOM-free. Resolve each display recipe with `applyDirection(recipe, direction)`. Reuse `proofSvg`, `aspectRatio`, `getStyle`, and `getFont`; pass the actual aspect ratio, trimmed headline, and non-empty supporting lines into each proof. Render aligned labels for Layout, Imagery, Finish, Palette, Type, Principle, Tradeoff, and Try this. Use `Style decides` when the resolved recipe font is `style`.

- [ ] **Step 6: Run tests and the type check**

Run:

```bash
./scripts/with-node.sh pnpm test:discovery
./scripts/with-node.sh pnpm check
```

Expected: PASS.

- [ ] **Step 7: Commit the comparison renderer**

```bash
git add src/lib/prompt-studio/ui/direction-comparison.ts src/lib/prompt-studio/ui/directions.ts scripts/test-prompt-discovery.mjs
git commit -m "feat: add direction comparison rendering"
```

### Task 4: Integrate comparison and readability into the composer

**Files:**

- Modify: `src/layouts/components/PromptStudio.astro:215-319,838-1178`
- Modify: `src/lib/prompt-studio/ui/app.ts:199-812,1494-1522,1760-2050`
- Modify: `src/lib/prompt-studio/ui/styles.css:622-950,1716-2188,3074-3159,3171-3458`

**Interfaces:**

- Consumes: comparison functions from Task 3 and `getReadabilityHints` from Task 2.
- Adds mounts: `#direction-comparison-bar`, `#direction-explorer-comparison-bar`, and `#readability-hint`.
- Adds dialog: `#direction-comparison-dialog` with `#direction-comparison-content`.
- Extends `View` with `comparisonIds: string[]` only; this remains transient.
- Keeps existing apply hook: `[data-preset]`.

- [ ] **Step 1: Read the required current documentation**

Before editing Astro or CSS, connect to the configured Astro docs MCP and read the current guidance for client-side scripts, native dialogs, and accessible component markup. Use `astro-template-guidance` to read `component-usage.md` and `styling-and-theming.md`, then use the daisyUI skill for modal, button, badge, and card rules.

- [ ] **Step 2: Recheck the dependency decision**

Compare the completed pure modules and planned browser wiring with the dependency decision gate above. Record the conclusion in the plan progress note. Continue with vanilla TypeScript when the existing platform capabilities still cover the work. If a dependency has a clear net benefit, update the plan with the chosen package, its responsibility, evaluation, install step, lockfile changes, audit command, and removal boundary before writing integration code.

- [ ] **Step 3: Capture the failing browser baseline**

Start the app with `./scripts/with-node.sh pnpm dev`, then run `playwright-cli open` and `playwright-cli goto http://localhost:4321/`. Confirm the current cards have no comparison controls, no comparison dialog exists, and an exact-text `op-art` recipe shows no readability action. Record the relevant snapshot names in the plan progress note.

- [ ] **Step 4: Add the comparison and readability shells**

Add the two comparison-bar mounts adjacent to their corresponding direction lists. Add a native DaisyUI modal with the same header, explicit close form, and backdrop behavior as the font picker. Add a hidden readability region between the proof figure and target controls with `role="note"`; its action is a real button. Give `#direction-summary` `tabindex="-1"` so it is the stable focus destination after applying from the dialog.

- [ ] **Step 5: Wire comparison state and shared card rendering**

Initialize `view.comparisonIds` to `[]`. Pass `compared: view.comparisonIds.includes(direction.id)` in both card render paths. Use delegated events for `[data-compare-direction]`, `[data-open-comparison]`, and `[data-clear-comparison]`. Rerender both bars and both card lists after every selection change without resetting filters or pages. Announce third-item replacement with the replaced direction name.

- [ ] **Step 6: Wire dialog open, close, focus, and apply behavior**

Open only when two catalog directions resolve. Close the narrow-screen proof panel before `showModal()`. Render fresh comparison content from the current recipe on every open. Support Escape, the explicit close button, and backdrop close. Restore focus to the opener when it still exists, otherwise to the comparison bar in the same area. Applying from the dialog must call the existing `applyChosenDirection`, close the dialog, preserve Undo, clear comparison state, and focus the now-visible `#direction-summary`.

- [ ] **Step 7: Render the highest-priority readability hint**

Call `getReadabilityHints` during the existing render cycle. Render only the first hint, or hide the mount when none applies. `Review headline` closes the mobile proof panel, scrolls to `#f-headline`, and focuses it; `Review text` does the same for `#f-extra`. Do not modify the recipe or copy controls.

- [ ] **Step 8: Style desktop and narrow-screen behavior**

Use a two-column comparison grid at desktop widths and the font picker's full-height, vertically stacked modal pattern at narrow widths. Keep selection bars compact and wrapping. Keep compare and apply controls distinct, preserve visible focus, and ensure the readability note does not cover the copy dock or mobile action bar.

- [ ] **Step 9: Run automated verification**

Run:

```bash
./scripts/with-node.sh pnpm test:discovery
./scripts/with-node.sh pnpm check
```

Expected: PASS with zero Astro errors.

- [ ] **Step 10: Verify the comparison flow in a real browser**

With Playwright CLI:

- select one suggested and one explorer direction, including a direction hidden after a filter or page change;
- verify the two selection bars stay synchronized and a third selection replaces the oldest;
- open and close with pointer, Escape, and the explicit close button;
- apply each side in separate runs and confirm brief, exact text, output settings, Undo, and focus behavior;
- reload after selecting two directions and confirm comparison state clears while the saved recipe remains;
- trigger both readability rules, follow each review action, and confirm no hint appears for blank first-run text or `Leave clean space`;
- resize to 390 by 844 pixels, open the proof panel, then open comparison and confirm the proof panel closes and the dialog has no horizontal scrolling;
- inspect the console and confirm no errors.

- [ ] **Step 11: Commit the integrated comparison flow**

```bash
git add src/layouts/components/PromptStudio.astro src/lib/prompt-studio/ui/styles.css
git add -p src/lib/prompt-studio/ui/app.ts
git diff --cached -- src/lib/prompt-studio/ui/app.ts
git commit -m "feat: compare visual directions"
```

Stage only the comparison and readability hunks from `app.ts`. The pre-existing blank-first-run hunk around `initialRecipe` must remain unstaged.

### Task 5: Add principle-led learning and catalog-driven edition UI

**Files:**

- Modify: `src/lib/prompt-studio/domain/references.ts:11-145,340-343`
- Modify: `src/layouts/components/PromptStudio.astro:1089-1162,215-319`
- Modify: `src/lib/prompt-studio/ui/app.ts:502-812,1616-1720,2035-2050`
- Modify: `src/lib/prompt-studio/ui/styles.css:833-950,2193-2355,3143-3159`
- Modify: `scripts/test-prompt-discovery.mjs`

**Interfaces:**

- Produces: `LEARNING_TOPICS`, `LearningTopicId`, and optional `ReferenceDef.topics?: readonly LearningTopicId[]`.
- Produces: `filterReferences(references: readonly ReferenceDef[], kind: ReferenceKind | "all", topic: LearningTopicId | "all"): readonly ReferenceDef[]`.
- Extends `View` with `refTopic: LearningTopicId | "all"`.
- Replaces `#direction-2026` with generic `#direction-current-edition` and adds `#direction-current-edition-label`.
- Adds mounts: `#ref-learning-tools`, `#ref-topic-filters`, `#ref-learning-paths`, and `#ref-active-filters`.

- [ ] **Step 1: Write failing reference-topic and edition-UI data tests**

Add tests named:

- `every learning topic has at least one tagged reference`
- `reference kind and learning topic filters share an intersection`
- `all topic clears only the topic restriction`
- `non-learning kinds cannot be constrained by a hidden learning topic`
- `current edition exposes the UI label used by the explorer`

Pin these topic IDs and labels: `hierarchy`, `typography`, `color-rhythm`, `material`, and `story-place`. Assert `story-place` includes both Adobe learning references, `typography` includes Figma typography, and `hierarchy` includes Cooper Hewitt.

- [ ] **Step 2: Run the test and verify it fails**

Run: `./scripts/with-node.sh pnpm test:discovery`

Expected: FAIL because topic metadata and `filterReferences` do not exist.

- [ ] **Step 3: Add topic metadata and filtering**

Define labels `Hierarchy`, `Typography`, `Color and rhythm`, `Material`, and `Story and place`. Tag only the design-learning references. Assign enough tags that every topic has at least one result. Implement `filterReferences` so kind and topic combine; if kind is not `learning`, ignore the topic defensively because the UI clears it when changing kinds.

- [ ] **Step 4: Add the learning controls and active-filter mount**

Add a hidden learning-tools container above the source carousel. Inside it, add the topic-filter and learning-path mounts. Add the active-filter mount below the source-kind toolbar. Keep the existing source cards and carousel navigation.

- [ ] **Step 5: Wire topic filters and learning paths**

Initialize `view.refTopic` to `"all"`. Show learning tools only while `view.refKind === "learning"`. Render one chip per topic plus `All topics`. Render paths `Focus and hierarchy`, `Type and legibility`, and `Material and place`; the third sets `story-place`, while `material` remains a topic chip. Use `filterReferences` for results. Switching to another kind clears `refTopic`; removing the topic pill clears only the topic; removing the kind pill restores `all`; clear-all resets both. Restore focus to the control that caused each change.

- [ ] **Step 6: Make the current-edition filter catalog-driven**

Rename the hardcoded checkbox ID to `direction-current-edition`. Set its label to `${CURRENT_TREND_EDITION.label} only`, pass `CURRENT_TREND_EDITION.year` into `filterDirections`, use the edition label in the active-filter pill and result status, and update the removal-focus map. Keep the control a checkbox.

- [ ] **Step 7: Style learning controls without expanding the default path**

Hide the topic and path rows outside `Design learning`. Let chips wrap at narrow widths. Keep the source carousel and navigation stable when filters change. Use the shared active-filter styles rather than adding a second pill system.

- [ ] **Step 8: Run automated verification**

Run:

```bash
./scripts/with-node.sh pnpm test:discovery
./scripts/with-node.sh pnpm check
```

Expected: PASS.

- [ ] **Step 9: Verify learning and edition behavior in a real browser**

With Playwright CLI, choose `Design learning`, use each principle path, combine and remove topic filters, switch to a non-learning kind, clear all, and confirm status counts and carousel content. In the direction explorer, toggle the current-edition filter, remove its pill, combine it with search and goal, and confirm focus and result counts. Repeat at 390 pixels and inspect the console.

- [ ] **Step 10: Commit learning and edition UI**

```bash
git add src/lib/prompt-studio/domain/references.ts src/layouts/components/PromptStudio.astro src/lib/prompt-studio/ui/styles.css scripts/test-prompt-discovery.mjs
git add -p src/lib/prompt-studio/ui/app.ts
git diff --cached -- src/lib/prompt-studio/ui/app.ts
git commit -m "feat: add principle-led design learning"
```

Again, stage only this task's `app.ts` hunks and leave the pre-existing `initialRecipe` hunk unstaged.

### Task 6: Document the shipped feature and run final verification

**Files:**

- Modify: `README.md`
- Modify: `PRODUCT.md`
- Modify: `docs/features.md`
- Modify: `docs/design-principles.md`
- Modify: `docs/architecture.md`
- Modify: `src/pages/guide.astro`
- Modify progress only: `docs/superpowers/plans/2026-10-25-direction-comparison-and-learning.md`

**Interfaces:**

- Documents: comparison versus the existing undirected-prompt comparison, optional readability advice, learning topics, and manual trend-edition maintenance.
- Adds no runtime interface.

- [ ] **Step 1: Read the required page-authoring documentation**

Before editing `guide.astro`, reconnect to the Astro docs MCP for current page and client-markup guidance, then use `astro-template-guidance` for the page and component conventions that apply to the guide.

- [ ] **Step 2: Update user and maintainer documentation**

Document that direction comparison is session-only, compares resolved values against the current recipe, and does not apply either direction until chosen. Explain that readability messages are optional editorial heuristics. Document learning topics and the manual edition checklist: verify source availability, update checked dates, review principles and tradeoffs, update edition IDs, and choose the current edition without implying popularity.

- [ ] **Step 3: Update the guide**

Add concise user-facing instructions for adding two directions to comparison, applying from the dialog, following a readability review action, and filtering learning sources by topic. Keep `Compare with an undirected prompt` documented as a separate copy-stage feature.

- [ ] **Step 4: Run formatting and lint checks**

Run:

```bash
./scripts/with-node.sh pnpm exec prettier --check README.md PRODUCT.md docs/features.md docs/design-principles.md docs/architecture.md src/pages/guide.astro src/layouts/components/PromptStudio.astro src/lib/prompt-studio/domain src/lib/prompt-studio/ui scripts/test-prompt-discovery.mjs
./scripts/with-node.sh pnpm lint
```

Expected: PASS.

- [ ] **Step 5: Run tests, Astro diagnostics, and the production build**

Run:

```bash
./scripts/with-node.sh pnpm test:discovery
./scripts/with-node.sh pnpm check
./scripts/with-node.sh pnpm build
```

Expected: all tests pass, Astro reports zero errors, and the production build and route validation complete.

- [ ] **Step 6: Complete the final browser pass**

Use Playwright CLI on `http://localhost:4321/` in light and dark themes at desktop and 390 by 844 pixels. Walk through blank first use, suggested-plus-explorer comparison, third-item replacement, apply and Undo, both readability rules, topic filters, current-edition filtering, keyboard-only dialog use, and copy actions. Confirm the existing font dialog, undirected prompt comparison, filter pills, and mobile proof panel still work. Check the browser console after each viewport.

- [ ] **Step 7: Review scope and repository state**

Run `git diff --check`, inspect `git diff --stat` and `git status --short`, and confirm the pre-existing blank-first-run `app.ts` work was preserved rather than overwritten or committed accidentally in an earlier task.

- [ ] **Step 8: Commit documentation and plan completion**

```bash
git add README.md PRODUCT.md docs/features.md docs/design-principles.md docs/architecture.md src/pages/guide.astro docs/superpowers/plans/2026-10-25-direction-comparison-and-learning.md
git commit -m "docs: explain direction comparison and learning"
```

- [ ] **Step 9: Request final code review**

Use `superpowers:requesting-code-review` against the implementation range. Resolve findings, rerun affected verification, and leave the branch with only the user's unrelated pre-existing changes unstaged.

## Addendum: accepted scope

See "Accepted scope additions" in the design spec. The `/compare` page, Open in links, copy feedback, grouped menu and brief-field placeholders shipped alongside this plan. Task 5 (principle-led learning) and the catalog-driven edition UI are now implemented: `filterReferences`, `LEARNING_TOPICS`, the topic chips and paths, and `CURRENT_TREND_EDITION` in the explorer.
