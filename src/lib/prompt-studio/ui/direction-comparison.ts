import { applyDirection } from "../domain/discovery";
import { getFont } from "../domain/fonts";
import type { Direction } from "../domain/presets";
import { aspectRatio, type Recipe } from "../domain/recipe";
import { getStyle } from "../domain/styles";
import { esc } from "./escape";
import { inksFrom, proofSvg } from "./sketch";

export interface ComparisonSelectionResult {
  readonly ids: readonly string[];
  readonly replacedId?: string;
}

function firstTwoUniqueIds(ids: readonly string[]): string[] {
  return [...new Set(ids.map((id) => id.trim()).filter(Boolean))].slice(0, 2);
}

export function toggleComparisonSelection(
  current: readonly string[],
  directionId: string,
): ComparisonSelectionResult {
  const ids = firstTwoUniqueIds(current);
  const id = directionId.trim();
  if (!id) return { ids };

  if (ids.includes(id)) {
    return { ids: ids.filter((selectedId) => selectedId !== id) };
  }
  if (ids.length < 2) return { ids: [...ids, id] };
  return { ids: [ids[1]!, id], replacedId: ids[0] };
}

export function renderComparisonBar(directions: readonly Direction[]): string {
  const selected = directions.slice(0, 2);
  if (selected.length === 0) return "";
  const names = selected
    .map(
      (direction) =>
        `<span class="badge badge-outline comparison-selection">${esc(direction.name)}</span>`,
    )
    .join("");
  const disabled = selected.length < 2 ? " disabled" : "";
  return `<div class="direction-comparison-bar" role="status">
    <div class="direction-comparison-summary">
      <span class="direction-comparison-count">${selected.length} of 2 selected</span>
      <div class="direction-comparison-names">${names}</div>
    </div>
    <div class="direction-comparison-actions">
      <button type="button" class="btn btn-ghost btn-sm" data-clear-comparison>Clear</button>
      <button type="button" class="btn btn-primary btn-sm" data-open-comparison${disabled}>Compare directions</button>
    </div>
  </div>`;
}

function renderPalette(recipe: Recipe): string {
  return `<span class="comparison-palette">${recipe.palette
    .map(
      (color) =>
        `<span class="comparison-swatch" style="background:${esc(color.hex)}" aria-label="${esc(`${color.name}, ${color.hex}`)}" title="${esc(`${color.name} ${color.hex}`)}"></span>`,
    )
    .join("")}</span>`;
}

function renderDetail(label: string, value: string): string {
  return `<div class="comparison-detail"><dt>${label}</dt><dd>${value}</dd></div>`;
}

function renderColumn(
  direction: Direction,
  recipe: Recipe,
  index: number,
): string {
  const resolved = applyDirection(recipe, direction);
  const design = getStyle(resolved.styles.design);
  const art = getStyle(resolved.styles.art);
  const technique = getStyle(resolved.styles.technique);
  const font =
    resolved.font === "style"
      ? getFont(design.fontId ?? "inter")
      : getFont(resolved.font);
  const typeLabel =
    resolved.font === "style"
      ? "Style decides"
      : (font?.family ?? resolved.font);
  const { w, h } = aspectRatio(resolved.aspect);
  const headline = resolved.headline.trim();
  const supportingText = resolved.extraText
    .map((line) => line.trim())
    .filter(Boolean);
  const proof = proofSvg({
    ...resolved.styles,
    inks: inksFrom([
      resolved.palette[0].hex,
      resolved.palette[1].hex,
      resolved.palette[2].hex,
    ]),
    ratio: h / w,
    headline,
    foot: supportingText,
    fontCss: font?.css ?? "sans-serif",
    condensed: font?.id === "oswald" || font?.id === "bebas",
    uid: `comparison-${index}`,
    label: `${direction.name}: ${design.name}, ${art.name}, ${technique.name}`,
  });

  return `<section class="direction-comparison-column" data-direction-id="${esc(direction.id)}">
    <h3>${esc(direction.name)}</h3>
    <div class="direction-comparison-proof">${proof}</div>
    <dl class="direction-comparison-details">
      ${renderDetail("Layout", esc(design.name))}
      ${renderDetail("Imagery", esc(art.name))}
      ${renderDetail("Finish", esc(technique.name))}
      ${renderDetail("Palette", renderPalette(resolved))}
      ${renderDetail("Type", esc(typeLabel))}
      ${renderDetail("Principle", direction.principle ? esc(direction.principle) : "—")}
      ${renderDetail("Tradeoff", direction.tradeoff ? esc(direction.tradeoff) : "—")}
      ${renderDetail("Try this", direction.practiceTip ? esc(direction.practiceTip) : "—")}
    </dl>
    <button type="button" class="btn btn-primary" data-preset="${esc(direction.id)}">Use ${esc(direction.name)}</button>
  </section>`;
}

export function renderDirectionComparison(
  directions: readonly [Direction, Direction],
  recipe: Recipe,
): string {
  return `<div class="direction-comparison-grid">${directions
    .map((direction, index) => renderColumn(direction, recipe, index))
    .join("")}</div>`;
}
