# Dedicated Font Picker Design

## Intent

Help Visual Prompt Studio users browse, compare, and select a font with less scrolling and clearer feedback. The current picker puts search, filters, results, and style controls in an anchored dropdown that can extend below the visible area.

## Goals

- Give the existing curated local font library a focused browse and compare surface.
- Make the selected family and its live specimen easy to see while browsing.
- Keep search, category filters, popularity, and supported bold/italic choices.
- Preserve current recipe persistence and prompt generation behavior.
- Keep the experience usable by keyboard and on narrow screens.

## Non-goals

- Add or remove font families or change their local caching.
- Change what the image model receives in generated prompts.
- Redesign the rest of the prompt studio.

## Approaches considered

1. Refine the existing anchored dropdown with denser filters and richer result cards. This is the smallest change, but keeps the list constrained by its position in the page.
2. Open a dedicated responsive font picker. This gives browsing and specimen comparison their own space and avoids hiding results below the fold. **Selected:** the user accepted this recommended direction.

## Design decisions

- Keep a compact selected-font summary in the Typography section with a clear “Choose typeface” action and the existing bold/italic controls.
- Open a native dialog styled with DaisyUI. On desktop, place searchable and filterable font results beside a larger live specimen and style controls.
- On mobile, use a full-height dialog with a compact search/filter area, scrollable font results, and an easy-to-find current selection.
- Selecting a family updates the existing recipe and the dialog specimen immediately; closing the dialog returns to the Typography section with the selection intact.
- Keep the “Let the style decide” choice, popular marker, and current explanatory note about font popularity and model behavior.
- Use existing theme tokens and the local font assets. Do not introduce a new visual identity.

## Constraints and open implementation details

- Use semantic controls and preserve focus on the picker trigger when the dialog closes.
- Support Escape to close, visible close control, keyboard navigation, an announced result count, and selected-state feedback.
- Keep bold and italic availability tied to the selected family’s bundled files.
- Follow the existing Astro, Tailwind, and DaisyUI conventions; use a small amount of scoped CSS only for the responsive two-pane layout and specimen presentation.
