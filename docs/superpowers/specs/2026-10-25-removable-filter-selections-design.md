# Removable filter selections design

## Intent

Help people see which filters are active and remove one or reset a filter area without hunting through its controls.

## Goals

- Show each active filter as a pill with its name and selected value.
- Let users remove one filter or clear every active filter in its area.
- Apply this to the direction explorer, each style browser, the font picker, and inspiration sources.
- Keep keyboard and screen-reader interaction clear.

## Non-goals

- Do not change the selected direction or the styles applied to the recipe. These are content choices, not browse filters.
- Do not treat the direction grouping control or pagination as filters.
- Do not change filter matching, catalog contents, or prompt generation.

## Approaches considered

1. Build a shared filter component that owns controls, state, rendering, and reset behavior. The four areas use different controls and state, so a single component would add abstraction around unrelated details.
2. Keep every pill and clear action local to its filter area. This fits the existing code but duplicates markup and accessibility behavior.
3. Share a small client-side pill renderer and its styles, while keeping filter values, removal handlers, and reset behavior local to each area. **Selected:** the user accepted this recommendation. It shares the repeated interaction without forcing the different filter controls into one component.

## Design decisions

- Show removable pills only for active, non-default filters. Include the filter name and value, such as `Project type: Poster` or `Search: editorial`.
- Put the pills and a `Clear all` action near the controls in each filter area. Show `Clear all` only when that area has active filters.
- Removing a pill resets only its filter to its default and returns that area to its first results page.
- `Clear all` resets all active filters in that area to their defaults and returns it to its first results page. It does not change selections in other areas.
- Cover direction search, project type, communication goal, style layer, and curated-only. Exclude `Group directions by` because it changes presentation, not the result set.
- Cover style search, group, and curated-only for each of the three style layers.
- Cover font search and category, including Popular when selected.
- Cover the active inspiration source category. `All` is the default and has no active pill.
- Keep actual chosen directions and recipe styles out of these filter pills. The style browsers already show the current recipe style separately, and required style layers do not all support an empty selection.
- Use semantic buttons with accessible names that identify the filter being removed. Announce filter changes through the existing status region or an equivalent polite live region.

## Constraints and implementation calls

- The composer is a typed browser-side module in `src/lib/prompt-studio/ui/app.ts`; Astro renders the surrounding markup. Implement shared pill markup through a small typed helper in that module and shared CSS in the existing stylesheet.
- Keep each area's filter state and reset logic local. Do not add dependencies or change the data model.
- Use existing DaisyUI and theme conventions. Preserve focus sensibly after removal or clear-all, and keep the pill row usable at narrow widths.
