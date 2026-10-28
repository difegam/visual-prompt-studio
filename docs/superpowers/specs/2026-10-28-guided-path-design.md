# Guided path

## Intent

The composer shows every control at once, so first-time users face dozens of choices (29 layer styles, 16 directions, palettes, 14 typefaces, 19 exclusions, six prompt shapes). Give them a **guided path**: a few choices at a time, with a recommended next move. Keep flexibility through **detours** and **advanced options**, and let experienced users switch to an **Expert view** that shows everything.

## Goals

- A first-time user reaches a copyable prompt by making roughly four decisions.
- Every existing control stays reachable; nothing is removed.
- The live proof and compiled prompt stay visible while the user moves through the steps.
- Experienced users can restore the all-controls layout and keep it.

## Non-goals

- Changing the recipe schema, compiler, storage format, import/export or recommendation logic.
- Adding dependencies.
- URL routing or deep links for steps.
- Locking steps or blocking progress with validation.

## Terms

Defined in `docs/glossary.md`: Guided path, Step, Main road, Detour, Advanced option, Expert view.

## Experience

### Step rail

A rail with four steps: **Describe, Look, Refine, Send**. It shows one step's controls at a time with Back and Next. Each step shows a one-line summary of the current choice (for example "Look: Chromatic pulse"). A step is marked done only when it has a value. Nothing is locked: any step can be opened from the rail, and Next is always enabled. On the last step, Next becomes "Copy prompt".

### Main road

| Step     | Main road                                                               |
| -------- | ----------------------------------------------------------------------- |
| Describe | Idea, format, goal, headline                                            |
| Look     | Pick one recommended direction                                          |
| Refine   | Optional. A few suggested palette and typeface choices                  |
| Send     | Target model buttons and Copy prompt (the copy dock in the proof panel) |

Skipping adds no new defaults. A skipped Refine keeps the palette and type that came with the direction. A skipped Look keeps the recipe's existing starting look (`BLANK_RECIPE` is not empty: Swiss layout, Surrealism imagery, Risograph finish, a default palette), exactly as the app behaves today. Look counts as done once a direction is applied in this session or the layers differ from that starting look.

### Detours

Each detour leaves the main road and returns to the same step.

1. Describe: "Try an example" (exists).
2. Look: browse all 16 directions in the explorer, or compare two (exist).
3. Look: "Build the look layer by layer" (layout, imagery, finish, palette).
4. Send: "Start from an existing image" (Restyle in same chat, Edit with reference).

### Advanced options

Collapsed, reachable from any step, placed with the step they belong to:

- Describe: custom aspect ratio, supporting text lines, concept.
- Refine: full font picker, exclusions, authorial intent.
- Send: prompt shape (defaults to the shape recommended for the target), language, model parameters, import/export.

### Expert view

A toggle that turns off the step rail and shows every control in the current long-page layout, all sections expanded. It is a remembered preference in `localStorage` (own key, separate from the recipe). The guided path is the default for everyone, including returning users with a saved recipe, until they switch.

### Intro

The three static "1-2-3" steps are removed because the rail replaces them. The one-line explainer, the "Hide intro" behavior and the guide link stay.

### Proof and prompt panel

Sticky on the right on desktop, as today. On mobile it collapses to a compact bar showing a prompt preview and Copy, so the step content takes the page.

### Navigation state

The current step is held in memory only, never in the URL. On load the user lands on step 1, or on the first step with no value when a saved recipe exists.

## Accessibility

- The rail is a list of buttons; the active one has `aria-current="step"`.
- Changing step moves focus to that step's heading.
- A polite live region announces "Step 2 of 4: Look".
- No transitions under `prefers-reduced-motion`.
- Expert view and guided path expose the same controls with the same labels and ids.

## Architecture

- A small typed module in `src/lib/prompt-studio/ui/guided-path.ts` holds the step list, current step, step summaries and done state as pure functions over the recipe. The Expert flag is the only state it persists.
- `PromptStudio.astro` regroups existing controls into step panels with `data-step` attributes. Control ids stay unchanged so `app.ts` bindings keep working.
- `app.ts` gains a thin binding layer: render the rail, show or hide panels, move focus, announce, read and write the Expert flag.
- Recipe, compiler, persistence and recommendation modules are untouched.
- Expert view is the same markup with the rail hidden and all panels visible (CSS and a root `data-view` attribute), so there is one code path for the controls.

## Constraints

- Vanilla TypeScript, daisyUI 5 and Tailwind 4 conventions already in the project. No new dependencies.
- Read the Astro docs via the Astro docs MCP server and the `astro-template-guidance` skill before editing markup or styles.
- Local-first: no network requests.

## Testing

- Unit tests (node --test, in `scripts/test-prompt-discovery.mjs` or a sibling file using the same vite loader) for step order, summaries, done state, and first-incomplete-step on load.
- Browser verification with `playwright-cli`: desktop and mobile, guided and Expert, keyboard-only pass, focus and announcement on step change, a copy of the prompt from the Send step, saved-recipe reload.
- `pnpm check`, `pnpm lint`, `pnpm format:check`, `pnpm build`.

## Docs

Update `docs/features.md`, the `/guide` page, `PRODUCT.md` operating context, and the changelog entry that ships with the change. No ADR: the change is easy to reverse and changes no data format.

## Open implementation calls

- Exact suggested palettes and typefaces in Refine (default: the direction's own, plus two alternates from the existing catalogs).
- Compact mobile bar layout.
- Rail visual design (follow `DESIGN.md`).
