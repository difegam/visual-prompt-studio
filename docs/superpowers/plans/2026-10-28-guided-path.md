# Guided path implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a step-by-step guided path (Describe, Look, Refine, Send) with detours and advanced options, plus an Expert view that restores the all-controls layout.

**Architecture:** One pure typed module (`guided-path.ts`) owns step order, summaries and done state. `PromptStudio.astro` regroups existing controls into `data-step` panels without changing ids. `app.ts` adds a thin binding layer for the rail, focus, announcements and the Expert flag. Expert view is the same markup with the rail hidden and panels shown.

**Tech Stack:** Astro, TypeScript, daisyUI 5, Tailwind CSS 4, `playwright-cli`.

**Spec:** `docs/superpowers/specs/2026-10-28-guided-path-design.md`

## Global Constraints

- No new dependencies. No change to recipe schema, compiler, storage or recommendations.
- Keep every control id and label unchanged.
- Skipped steps never inject defaults.
- Before editing Astro markup or styles, read the relevant Astro docs through the Astro docs MCP server and the `astro-template-guidance` skill.
- Verify UI in a real browser with `playwright-cli` (`pnpm dev`, then full `http://localhost:4321/` URLs).

## Review Focus

- A saved recipe with only a brief: lands on Look, rail shows Describe done.
- Blank recipe skips Look: prompt uses the existing starting look (Swiss / Surrealism / Risograph), unchanged from today.
- Applying a direction then skipping Refine: palette and type come from the direction.
- Expert on, reload: still Expert. Expert off: guided, step 1 or first incomplete.
- Focus lands on the step heading; the live region announces once per change.
- Controls inside collapsed advanced sections and hidden step panels are not reachable by Tab until shown.
- Mobile bar keeps Copy reachable and does not cover form fields.

## Task 1: Step model

**Files:** create `src/lib/prompt-studio/ui/guided-path.ts`

- [ ] Export `STEPS` (`describe`, `look`, `refine`, `send`) with id, label and heading.
- [ ] Export `stepSummary(step, recipe)` returning a one-line string (idea or format for Describe, direction or "Custom look" for Look, palette and typeface for Refine, target for Send).
- [ ] Export `isStepDone(step, recipe)`: Describe needs an idea or headline; Look needs a direction applied this session (`directionChosen` flag) or layers that differ from `BLANK_RECIPE.styles`; Refine needs a palette differing from `BLANK_RECIPE.palette` or `font !== "style"`; Send is done once a target is set.
- [ ] Export `initialStep(recipe)`: first step not done, else `describe`.
- [ ] Export `loadExpert()` and `saveExpert(value)` using key `visual-prompt-studio.view.v1`, wrapped in try/catch, defaulting to guided.
- [ ] Check the real recipe field names in `domain/recipe.ts` before writing the predicates.

## Task 2: Unit tests

**Files:** modify `scripts/test-prompt-discovery.mjs` (or add a sibling using the same vite loader)

- [ ] Test step order, `stepSummary` for blank and filled recipes, `isStepDone` per step, `initialStep` for blank, brief-only and complete recipes.
- [ ] Test `loadExpert` defaults to false when storage throws.
- [ ] Run `pnpm test:discovery`.

## Task 3: Regroup markup into step panels

**Files:** modify `src/layouts/components/PromptStudio.astro`

- [ ] Read the Astro docs and template guidance first.
- [ ] Wrap existing sections in panels: Describe (brief, goal, examples, "Add text and size" disclosure), Look (directions, explorer, compare, "Build the look layer by layer" disclosure around the layers section), Refine (palette suggestions, then "More type options", exclusions and authorial intent as disclosures), Send (target buttons, copy dock, "Start from an existing image" detour, "Advanced" disclosure for prompt shape, language and parameters, import/export).
- [ ] Add the rail markup (`ol` of buttons, `aria-current`), Back/Next, an `aria-live="polite"` region, and an Expert view toggle in `StudioBar`.
- [ ] Remove the three static intro steps; keep the explainer, guide link and Hide intro.
- [ ] Keep all existing ids; confirm with a grep of ids before and after.

## Task 4: Bind the rail

**Files:** modify `src/lib/prompt-studio/ui/app.ts`

- [ ] Render summaries and done marks from `guided-path.ts` on every recipe change.
- [ ] Show only the active panel in guided view; set `data-view="expert"` on the root to show all.
- [ ] On step change: move focus to the panel heading (`tabindex="-1"`), update the live region, set `aria-current`.
- [ ] Wire Back, Next ("Copy prompt" on the last step triggers the existing copy handler), and the Expert toggle (persist with `saveExpert`).
- [ ] Choose the initial step with `initialStep` after the recipe loads.
- [ ] Respect `prefers-reduced-motion`.

## Task 5: Styles

**Files:** modify `src/lib/prompt-studio/ui/styles.css`

- [ ] Style the rail, active, done and summary states per `DESIGN.md`.
- [ ] Hide the rail and show all panels under `[data-view="expert"]`.
- [ ] Mobile: compact bottom bar with prompt preview and Copy; ensure the step content has bottom padding so it is not covered.
- [ ] Keep desktop sticky proof and copy dock unchanged.

## Task 6: Browser verification

- [ ] `pnpm dev`; with `playwright-cli`, walk Describe to Send on desktop and mobile, then Expert on and off, then reload with a saved recipe.
- [ ] Keyboard-only pass: rail, Back/Next, detours, disclosures.
- [ ] Check `console` for errors; run a Chrome DevTools a11y audit.
- [ ] Confirm each detour returns to its own step.

## Task 7: Docs and checks

- [ ] Update `docs/features.md`, the `/guide` page (`src/pages/guide.astro`), and the `PRODUCT.md` operating context.
- [ ] Add the changelog entry in the project's existing format.
- [ ] Run `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm test:discovery`, `pnpm build`.
- [ ] Report any failing check with its output.
