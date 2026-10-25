# Dedicated Font Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the crowded anchored font list with a responsive dialog that lets users search, compare, and select local typefaces while keeping the existing preview and prompt behavior.

**Architecture:** Keep the curated font data and recipe/compiler interfaces unchanged. Move the existing search, category filters, font results, specimen, and emphasis controls into a DaisyUI-styled native dialog in `PromptStudio.astro`; update `app.ts` to coordinate open/close, selected font, filters, and live preview. Use scoped styles for a two-pane desktop layout and full-height mobile layout.

**Tech Stack:** Astro, TypeScript, Tailwind CSS v4, daisyUI 5, existing Fontsource assets, Browser visual review.

**Spec:** `docs/superpowers/specs/2026-10-25-font-picker-dialog-design.md`

## Global Constraints

- Use a native dialog styled with DaisyUI.
- On desktop, place searchable and filterable font results beside a larger live specimen and style controls.
- On mobile, use a full-height dialog with a compact search/filter area, scrollable font results, and an easy-to-find current selection.
- Selecting a family updates the existing recipe and the dialog specimen immediately; closing the dialog returns to the Typography section with the selection intact.
- Keep the “Let the style decide” choice, popular marker, and current explanatory note about font popularity and model behavior.
- Use existing theme tokens and local font assets; do not introduce a new visual identity.
- Preserve keyboard operation, focus return, Escape close, visible close control, live result count, and font-specific bold/italic availability.
- Do not change font-family data, recipe schema, compiler output semantics, or external dependencies.

## Review Focus

- **Keyboard/focus:** opening, Escape, close button, and focus restoration to the trigger; verify in the Browser.
- **Search/filter state:** query, category, Popular, empty state, and clear action compose correctly; verify result count and matching families in the Browser.
- **Selection consistency:** selecting a font updates its pressed state, dialog specimen, Typography summary, style controls, and existing prompt; verify with a known font such as Roboto.
- **Variant support:** unsupported weight/italic controls remain unavailable and do not change prompt output; verify with a family that lacks a bundled modifier.
- **Viewport fit:** dialog contents remain reachable without clipping at desktop and narrow mobile widths; inspect both in the Browser.

---

### Task 1: Move font browsing into a native dialog

**Files:**

- Modify: `src/layouts/components/PromptStudio.astro` (Typography section)
- Modify: `src/lib/prompt-studio/ui/app.ts` (font picker setup and render functions)

**Interfaces:**

- Consume existing `FONTS`, `getFont`, `Recipe`, `patch`, and `render` interfaces without schema changes.
- Keep `data-font`, `data-font-category`, `data-font-search`, `data-font-weight`, and `data-font-italic` hooks where they are still needed; introduce `#font-picker-dialog` and `#font-picker-trigger` as stable dialog endpoints.
- The native dialog owns browse/compare state; recipe state remains the source of truth for current selection and modifiers.

- [x] **Step 1: Add semantic dialog markup** with a visible close button, labelled search, category controls, popularity note, style-decides choice, result count, font result region, current specimen, and supported emphasis controls. Use DaisyUI `modal`, `modal-box`, `input`, `btn`, `join`, and theme-aware colors.
- [x] **Step 2: Migrate existing font event handling** to open with `showModal()`, close with the close button and native Escape behavior, restore focus to the trigger, retain delegated search/category/result handling, and update the recipe selection plus in-dialog specimen immediately.
- [x] **Step 3: Preserve state and capability behavior** so current font selection remains visible when the dialog opens, the style-decides option clears it, result counts and empty-state recovery continue to work, and unsupported bold/italic controls stay disabled.
- [x] **Step 4: Manually verify interaction behavior in the Browser:** open/close by keyboard and pointer, search Roboto, filter a category, clear a no-results query, select a family, and confirm the preview/summary/prompt stay in sync.

### Task 2: Style the responsive comparison surface

**Files:**

- Modify: `src/lib/prompt-studio/ui/styles.css` (font-picker styles)

**Interfaces:**

- Use the dialog structure and data hooks produced by Task 1.
- Reuse existing `--paper`, `--sheet`, `--ink`, `--muted`, `--line`, `--accent`, and DaisyUI semantic theme colors.

- [x] **Step 1: Create the desktop comparison layout** with a bounded dialog, searchable/filterable results pane, clear selected state, specimen preview pane, and controls kept near the specimen.
- [x] **Step 2: Create the mobile full-height layout** with a compact, persistent search/filter header, scrollable result list, safe-area spacing, and a clearly visible current specimen and close action.
- [x] **Step 3: Refine type specimens and selection feedback** so family name, category/classification, popular status, selected state, and available styles are distinguishable at a glance in light and dark themes.
- [x] **Step 4: Visually inspect the open dialog in the Browser** at desktop and 390px mobile widths, including long names, empty results, and selected states; adjust only issues found in this pass.

### Task 3: Build and hand off the verified picker

**Files:**

- No additional source files; update only the plan progress checkboxes during execution.

- [x] **Step 1: Run Astro diagnostics and the production build** using the project’s Node 22.23.4 toolchain; confirm zero Astro errors and that the static build completes.
- [x] **Step 2: Run the scoped formatting check** on changed Astro, TypeScript, and CSS files.
- [x] **Step 3: Complete the final Browser pass** in dark and light themes at desktop and mobile widths, then restore the default viewport and leave the verified local preview open for review.
- [x] **Step 4: Review the scoped diff** to confirm no unrelated workspace changes were staged or modified.
