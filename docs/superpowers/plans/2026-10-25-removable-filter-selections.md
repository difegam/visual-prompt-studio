# Removable filter selections implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show active filters as removable pills and let users clear all filters within each filter area.

**Architecture:** Add one typed client-side renderer for active-filter pills and a clear-all button. Keep filter state and reset handlers in the direction explorer, each style browser, font picker, and inspiration section. Add shared styling and explicit mount points to the existing Astro markup.

**Tech Stack:** Astro, TypeScript, DaisyUI 5, Tailwind CSS 4, existing project `playwright-cli` setup.

**Spec:** `docs/superpowers/specs/2026-10-25-removable-filter-selections-design.md`

## Global Constraints

- Keep each area's filter state and reset logic local.
- Do not add dependencies or change the data model.
- Do not change the selected direction or recipe styles.
- Use semantic controls and the existing DaisyUI and theme conventions.
- Preserve pagination reset, focus behavior, and narrow-screen usability.
- Before editing Astro markup or styles, read the relevant Astro docs through the Astro docs MCP server and read the component usage and styling references from `astro-template-guidance`.
- Do not add or run tests. Verify the UI in a real browser as required by the project instructions.

## Review Focus

- Search text with whitespace only: trim it when deciding whether a pill is active; removing it restores an empty search.
- Each select at its default value: show no pill; removing a non-default pill restores `all`.
- Curated-only unchecked: show no pill; removing its pill unchecks it.
- Font category `popular` and an individual category: show distinct values; removal restores `all`.
- Inspiration category `all`: show no pill; removing a selected category restores `all`.

---

### Task 1: Add the shared filter summary and mount points

**Files:**

- Modify: `src/layouts/components/PromptStudio.astro`
- Modify: `src/lib/prompt-studio/ui/app.ts`
- Modify: `src/lib/prompt-studio/ui/styles.css`

**Interfaces:**

- Produces: `type ActiveFilter = { key: string; label: string; value: string }` and `renderFilterSummary(area: string, filters: readonly ActiveFilter[]): string` in `app.ts`.
- `renderFilterSummary` returns an empty string when there are no active filters. Otherwise it returns a pill for each filter with `data-remove-filter="<key>"`, plus a `Clear all` button with `data-clear-filter-area="<area>"`.
- Pill buttons use an accessible name that identifies both the filter and value. Escape all displayed values with the existing `esc` helper.

- [x] **Step 1: Read the required documentation** before editing Astro markup or CSS. Use the Astro docs MCP server for relevant current guidance, then read `component-usage.md` and `styling-and-theming.md` through the `astro-template-guidance` skill.
- [x] **Step 2: Add mount points** in `PromptStudio.astro` for the direction explorer, each of the three style panels, the font picker, and inspiration filters. Give each mount point a unique ID and an accessible group label.
- [x] **Step 3: Add the shared renderer** in `app.ts` with the exact `ActiveFilter` type and `renderFilterSummary` signature above. Generate semantic pill and clear-all buttons only when the area has active filters.
- [x] **Step 4: Add shared styles** in `styles.css` for wrapping pills, remove affordance, focus-visible state, and clear-all control, using existing theme tokens and fitting mobile widths.
- [x] **Step 5: Inspect the changed markup and styles** to confirm the mounts sit adjacent to their corresponding controls, buttons have accessible names, and values pass through `esc`.

### Task 2: Integrate direction and style browser filters

**Files:**

- Modify: `src/lib/prompt-studio/ui/app.ts`

**Interfaces:**

- Consumes: `renderFilterSummary(area, filters)` from Task 1.
- Direction area key: `directions`. Filter keys: `query`, `format`, `goal`, `styleId`, `curatedOnly`.
- Style area keys: `style-design`, `style-art`, and `style-technique`. Filter keys: `query`, `group`, and `curatedOnly`.

- [x] **Step 1: Render active direction filters** from the current controls, using user-facing labels and selected option labels. Exclude `direction-group`.
- [x] **Step 2: Handle direction pill removal and clear-all clicks** with delegated events. Reset only the addressed control for pill removal; reset all direction filters for clear-all; set `directionPage = 1`; rerender.
- [x] **Step 3: Render active style filters** inside each layer's renderer using that layer's search, group, and curated values.
- [x] **Step 4: Handle style pill removal and clear-all clicks** for each layer. Reset only that layer's addressed filter or all its filters, set `styleBrowsePage[layer] = 1`, and rerender.
- [x] **Step 5: Review direction and style state changes** to confirm selected recipe styles remain unchanged and removing any filter returns that area's results to page one.

### Task 3: Integrate font and inspiration filters

**Files:**

- Modify: `src/lib/prompt-studio/ui/app.ts`

**Interfaces:**

- Consumes: `renderFilterSummary(area, filters)` from Task 1.
- Font area key: `fonts`. Filter keys: `query` and `category`.
- Inspiration area key: `inspiration`. Filter key: `kind`.

- [x] **Step 1: Render active font filters** whenever font search or category changes. Show Popular with its own label and map category IDs to their display labels.
- [x] **Step 2: Handle font pill removal and clear-all clicks** by resetting the addressed filter or both font filters, updating the selected category button state, and rerendering font options.
- [x] **Step 3: Render the active inspiration category** from `view.refKind`; show no pill for `all`.
- [x] **Step 4: Handle inspiration pill removal and clear-all clicks** by setting `view.refKind` to `all` and rerendering the source cards.
- [x] **Step 5: Review the font and inspiration state changes** to confirm removing a pill updates both the visible selected control and the filtered results.

### Task 4: Verify the complete UI in a browser

**Files:**

- Verify: direction explorer, all three style browsers, font picker, and inspiration source filters in the running app.

- [x] **Step 1: Start the app** with `pnpm dev` using the Node version from `.nvmrc` as described by `scripts/with-node.sh`.
- [x] **Step 2: Open the homepage** with `playwright-cli open` and `playwright-cli goto http://localhost:4321/`.
- [x] **Step 3: Verify direction and style filters** by activating multiple filters, removing one pill, clearing all, and confirming page one and unchanged recipe style selections.
- [x] **Step 4: Verify font and inspiration filters** by selecting search/category filters, removing individual pills, clearing all, and confirming the displayed controls and results update.
- [x] **Step 5: Verify responsive and keyboard behavior** with a mobile viewport and keyboard focus. Confirm pills wrap, names are announced, focus remains usable after removal, and browser console has no errors.
