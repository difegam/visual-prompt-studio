# Direction comparison and design learning

## Intent

Help image-prompt authors choose between visual directions, use each direction with more care, and learn the design ideas behind it. The current composer already recommends four directions, previews their visual layers, explains a principle and tradeoff for contemporary starters, and links to design references. This work collects the items deferred from the starter feature proposal: direction comparison, practical next-step advice, optional legibility nudges, topic-led learning, and maintainable trend editions.

The primary user is someone who has a brief and wants a useful visual direction without already knowing design terminology. The experience should help them make an informed choice and continue to the existing copy flow.

## Current baseline

The implementation must extend the project as it now exists:

- The catalog has 16 directions, including six 2026 starters, and shows four recommendations for the selected format and goal.
- Suggested and explorer cards share `renderDirectionCard`. Suggested cards use an info popover for their rationale and learning content, and explorer cards use the same popover pattern in a compact row.
- The direction explorer already combines search, format, goal, style, curated, and current-edition filters. It also has removable filter pills, clear-all behavior, pagination, and focus restoration.
- The copy dock already has a control labelled `Compare with an undirected prompt`. Direction comparison must use the full label `Compare directions` wherever a shorter label could be confused with that control.
- The native font-picker dialog is the established modal pattern. The comparison dialog should reuse its header, close, focus, desktop, and narrow-screen behavior.
- A first visit can start with blank recipe text while examples appear as placeholders. Comparison previews and readability rules must use actual recipe values, never placeholder copy.
- On narrow screens, the proof and prompt use their own overlay panel above the mobile action bar. Opening direction comparison must close that panel first so two modal surfaces never compete.

## Goals

- Let users compare two directions against the same brief before applying either.
- Turn each contemporary starter's tradeoff into one concrete action.
- Offer local, non-blocking text-legibility advice when a recipe combines exact text with a visual treatment that can compete with it.
- Make existing design-learning references findable by concept.
- Support annual trend editions while preserving older editions and checked-source dates.
- Preserve the quick path from brief to format, goal, direction, and copy.
- Add no permanent control to the copy dock and no extra required step before copying.

## Non-goals

- Do not add image generation, accounts, analytics, remote fetching, personalization, or popularity ranking.
- Do not add required recipe inputs or a new route.
- Do not change `RecipeSchema` from version 2 or store comparison selections, learning filters, or advisory state in a recipe.
- Do not grade the generated image or promise that its text will be legible. The app does not generate or inspect images.
- Do not treat editorial trend forecasts or community engagement as measured evidence of design effectiveness.
- Do not add a general trend-intensity or minimal-to-maximal control.
- Do not replace or rename the existing directed-versus-undirected prompt comparison.
- Do not restore example brief or poster text as real first-run values.

## Approaches considered

### Extend the current composer and reference catalog

Selected. Add an optional comparison dialog beside the current suggestions, enrich the direction metadata, derive local readability hints from the current recipe, and add concept filters to the existing learning-source area. This keeps the present workflow, uses the current static catalog and vanilla TypeScript architecture, and requires no dependency or schema migration.

### Create a separate trend and learning page

This would give articles and annual editions more room, but it would send users away from the brief and duplicate the existing direction and reference views. It does not fit the quick generation path.

### Replace the composer flow with a guided wizard

A wizard could teach concepts step by step, but it would repeat format, goal, and direction controls already visible in the composer. It would make learning a prerequisite for copying. Keep learning optional and next to the choice it explains.

## Experience and visual proposal

### Compare two directions

Each suggested and explorer card gets a secondary `Add to comparison` control. Users can select at most two directions. A compact comparison bar appears directly below the suggested list, and a matching bar appears at the top of the open explorer. Both show the selected direction names, a clear action, and a `Compare directions` button that becomes available when two directions are selected. The primary `Use this starter` or `Use this direction` action remains unchanged.

Selection state is shared between the suggested and explorer lists, survives filtering and pagination during the page session, and is never written to the recipe or local storage. A selected card exposes `aria-pressed="true"` on its comparison control. Selecting a third direction replaces the oldest selection and announces the change. Applying either selected direction clears comparison state after the existing Undo state has been recorded.

Opening comparison uses a native `<dialog>` styled with the same daisyUI modal structure and theme variables as the font picker. At desktop widths, two columns align each direction's proof preview, layout, imagery, finish, palette, type, principle, tradeoff, and practical tip. Each column has an apply action. Applying reuses the current safe `applyChosenDirection` behavior, closes the dialog, and preserves Undo.

The comparison values are resolved by applying each direction to the current recipe with the pure `applyDirection` helper, without updating the store. This matters for legacy directions that keep the current typeface or creative intent and derive a palette from their layout style. Each proof uses the current aspect ratio and actual headline and supporting text when present. Blank recipe fields stay blank.

At narrow widths, the dialog follows the font picker's full-height modal pattern. Direction details stack vertically in selection order with their labels and values together. It must not require horizontal scrolling. Escape, an explicit close button, and an optional backdrop close the dialog. Closing returns focus to the control that opened it. If that control disappeared because filters or pagination changed, focus returns to the relevant comparison bar.

```text
Compare directions (2 selected)                         Close

                 Raw human voice       One loud detail
Preview          [proof]               [proof]
Layout           Editorial             Japanese Minimal
Imagery          Dada Collage          Pop Art
Finish           Halftone               Mono + accent
Palette          [swatches]             [swatches]
Type             Style decides          Archivo Black
Principle        ...                    ...
Tradeoff         ...                    ...
Try this         ...                    ...

                 [Use this starter]     [Use this starter]
```

### Practical next step

Add optional `practiceTip?: string` metadata to `Direction`. Each contemporary starter receives one concise instruction that helps the user address its tradeoff. Suggested and explorer cards place it in the existing learning popover after the principle and tradeoff. The comparison dialog shows it as `Try this`. Tips are catalog content and never enter the recipe or compiled prompt.

Example for Chromatic pulse: `Keep the headline short and separate it from the repeating pattern.` Example for Local cut-paper story: `Name a real place, material, or object from your brief.` The first example may be adjusted for tone and fit without changing its intent.

### Readability nudges

Add a pure, local `getReadabilityHints(recipe: Recipe): ReadabilityHint[]` helper in a focused domain module. In the first version, produce an advisory when all of these are true: `textMode === "render"`, the trimmed headline or a trimmed supporting line is non-empty, and the imagery layer is `op-art`. The message asks the user to keep copy short and separate it from repeated shapes. A second, lower-priority rule flags three or more non-empty supporting lines when exact text is enabled and asks the user to establish one primary read.

Show the highest-priority applicable hint between the proof study and output controls. Keep it separate from compiler notices because it is editorial advice, not a target-model constraint. Include a `Review headline` or `Review text` action that closes the narrow-screen proof panel when necessary, scrolls to the existing field, and focuses it. Hints never disable copying, rewrite the recipe, change the prompt, or claim that the final generated image passes an accessibility check. Placeholder examples never trigger a hint. The initial rule set stays intentionally narrow to reduce false alarms.

### Principle-led learning

Add optional `topics` metadata to learning references using a stable topic ID set: `hierarchy`, `typography`, `color-rhythm`, `material`, and `story-place`. Display the topic chips when the user selects the existing `Design learning` source filter. Selecting a chip narrows the current carousel and combines with the learning kind filter. The inspiration area gains the established active-filter summary so both kind and topic can be removed independently. `All topics` clears only the topic selection. Switching to another source kind clears the hidden topic filter and restores focus to the selected kind control.

Place a small `Start with a principle` strip above the source carousel when `Design learning` is active. It has three suggested paths: `Focus and hierarchy` linked to Cooper Hewitt, `Type and legibility` linked to Figma typography, and `Material and place` linked to Adobe Express and Adobe's creative forecast. The third path selects `story-place`; `material` remains available as its own topic chip. Choosing a path sets the matching topic filter and leaves the external article links in the existing reference cards. Do not duplicate long article summaries or fetch remote content.

### Trend edition maintenance

Replace the single literal 2026 trend marker with a general numeric `trendYear` and a static `TREND_EDITIONS` catalog. Each edition has a year, a short editorial description, a `checked` date, and the direction IDs it contains. One exported constant identifies the current edition. The existing checkbox remains a current-edition filter so this work does not add another select. Its badge, label, active-filter pill, and result status come from the catalog instead of a hardcoded year. `DirectionFilters.trendYear` accepts a catalog year or `all`, and older edition directions remain searchable when the filter is off.

This release seeds only the six real 2026 starters. It does not invent an older edition to demonstrate the model. Tests validate the one-edition catalog and use test fixtures to prove that a later or older numeric edition can coexist and filter correctly.

The app continues to load static metadata only. There is no automatic expiry, update check, or network request. The maintenance note must say that a person should review source availability, record new checked dates, revise principles and tradeoffs, and decide whether an edition remains current. `current` is an editorial designation, not popularity evidence.

## User flow

1. The user edits the existing brief, format, and communication goal.
2. The user reviews the four suggested directions and can add any two suggested or explorer directions to comparison without applying them.
3. The user applies a direction from its card or the comparison view. The current recipe update and Undo behavior remain the same.
4. If the exact-text and visual-style combination triggers a readability hint, the user can follow it or ignore it.
5. The user refines the current visual controls and copies the prompt.
6. If they want to learn more, they open the existing reference area, choose a concept topic, and follow a linked article.
7. In the explorer, the user can filter by the current trend edition or search earlier editions with the other filters.

## Data and implementation constraints

- Preserve Astro plus vanilla TypeScript. Add no client framework or dependency.
- Preserve `RecipeSchema` version 2 and all saved recipe compatibility.
- Keep comparison selection, topic filters, and readability hints out of persisted state and compiled prompts.
- Apply direction bundles only through the existing allow-listed `applyDirection` contract.
- Keep trend and reference data static, local, deterministic, and reviewable.
- Use daisyUI modal, card, badge, and button patterns with semantic theme colors. Do not hardcode UI colors.
- Keep descriptive external link text with `target="_blank"` and `rel="noopener noreferrer"`.
- Keep controls keyboard reachable, restore focus after dialog close and apply, and preserve the current responsive layout.
- Extend the shared card renderer and existing info-popover and active-filter patterns. Do not add a second card renderer, disclosure pattern, or filter-summary implementation.
- Keep the uncommitted blank-first-run recipe change in `app.ts` intact while implementing this feature.

## Success checks

- A user can compare any two supported directions and apply either without losing the brief or output settings.
- Comparison is usable with keyboard and at 390 by 844 pixels without horizontal scrolling.
- Tips and readability hints explain an action and remain optional.
- Learning topic filters combine with the existing source filter and clear independently.
- The current-edition filter is driven by catalog data, and fixture tests show that older editions remain discoverable when the filter is off.
- Node tests cover comparison rendering and state helpers, safe resolution through `applyDirection`, advisory priority, topic filtering, edition validation and filtering, and no prompt or schema contamination.
- Playwright CLI verification covers keyboard focus, dialog close and apply behavior, comparison across suggested and explorer cards, the narrow-screen layout at 390 by 844 pixels, learning filters, and the readability jump action.

## Builder calls

- Keep comparison capped at two directions for the first release. The aligned view remains scannable and the first four suggestions are easy to compare.
- On mobile, stack the two comparison columns in the order the user selected them. Do not make a fixed-width comparison table.
- Reuse the font picker dialog behavior and close the mobile proof panel before opening comparison.
- Show only the highest-priority readability hint at once. Let the user continue without dismissing it.
- Treat readability thresholds as editorial heuristics. Do not calculate or display a numeric contrast score for an image palette.
- Use the existing reference records as the reading-path destinations. Add topic metadata rather than a second article catalog.
- Keep previous trend editions available. The catalog owner, not a date-based script, decides which edition is current.
