import { GOALS, type GoalId } from "../domain/discovery";
import type { Direction } from "../domain/presets";
import { DEFAULT_RECIPE } from "../domain/recipe";
import { getReference } from "../domain/references";
import { getStyle } from "../domain/styles";
import { getTrendEdition } from "../domain/trends";
import { renderInfoPopover } from "./info-popover";
import { inksFrom, proofSvg } from "./sketch";

export type DirectionCardVariant = "suggested" | "explorer";

export interface RenderDirectionCardOptions {
  variant: DirectionCardVariant;
  goal: GoalId;
  selected: boolean;
  readonly compared?: boolean;
}

const esc = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );

/** Render catalog content without accessing browser state or attaching handlers. */
export function renderDirectionCard(
  direction: Direction,
  options: RenderDirectionCardOptions,
): string {
  const design = getStyle(direction.patch.styles.design);
  const art = getStyle(direction.patch.styles.art);
  const technique = getStyle(direction.patch.styles.technique);
  const source = direction.sourceIds?.map(getReference).find(Boolean);
  const edition =
    direction.trendYear === undefined
      ? undefined
      : getTrendEdition(direction.trendYear);
  const learning = [
    direction.principle?.trim()
      ? `<p class="direction-principle"><b>Principle:</b> ${esc(direction.principle)}</p>`
      : "",
    direction.tradeoff?.trim()
      ? `<p class="direction-tradeoff"><b>Tradeoff:</b> ${esc(direction.tradeoff)}</p>`
      : "",
    direction.practiceTip?.trim()
      ? `<p class="direction-practice"><b>Try this:</b> ${esc(direction.practiceTip)}</p>`
      : "",
    source
      ? `<a class="link" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">Learn with ${esc(source.name)}</a>`
      : "",
  ].join("");
  const badges = [
    edition
      ? `<span class="badge badge-outline direction-trend-badge">${edition.year} starter</span>`
      : "",
    direction.curatedRank !== undefined
      ? '<span class="badge badge-outline curated-badge">Curated pick</span>'
      : "",
  ].join("");
  const label = edition ? "Use this starter" : "Use this direction";
  const button = (classes: string): string =>
    `<button type="button" class="${classes}" data-preset="${esc(direction.id)}" aria-pressed="${options.selected}">${label}</button>`;
  const compareButton = `<button type="button" class="btn btn-outline direction-compare" data-compare-direction="${esc(direction.id)}" aria-pressed="${options.compared === true}">${options.compared ? "Selected for comparison" : "Add to comparison"}</button>`;

  if (options.variant === "explorer") {
    return `<article class="direction-result card bg-base-100" role="listitem">
      <div class="card-body direction-result-copy">
        <div class="direction-title-row"><h4>${esc(direction.name)}</h4>${badges}</div>
        <p>${esc(direction.blurb)}</p>
        <small>Layout: ${esc(design.name)} · Imagery: ${esc(art.name)} · Finish: ${esc(technique.name)}</small>
        ${learning ? renderInfoPopover({ id: `info-result-${esc(direction.id)}`, label: "Why this starter works", content: `<div class="direction-learning">${learning}</div>` }) : ""}
      </div>
      <div class="card-actions">${button("btn btn-outline direction-result-apply")}${compareButton}</div>
    </article>`;
  }

  const palette =
    direction.patch.palette ?? design.palette ?? DEFAULT_RECIPE.palette;
  const inks = inksFrom([palette[0].hex, palette[1].hex, palette[2].hex]);
  const thumb = proofSvg({
    ...direction.patch.styles,
    inks,
    ratio: 1.25,
    headline: "",
    foot: [],
    fontCss: "sans-serif",
    condensed: false,
    uid: `direction-${esc(direction.id)}`,
    label: `${direction.name}: ${design.name}, ${art.name}, ${technique.name}`,
  });
  const goal = GOALS.find(({ id }) => id === options.goal)!;
  const rationale =
    direction.rationale[options.goal] ??
    `${goal.description} ${design.name} brings ${design.summary.toLowerCase()} while ${art.name} shapes the imagery and ${technique.name} defines the finish.`;
  return `<article class="card direction-card bg-base-100" role="listitem">
    <div class="direction-thumb">${thumb}</div>
    <div class="card-body direction-body">
      <div class="direction-title-row"><h3>${esc(direction.name)}</h3>${badges}</div>
      <p class="direction-blurb">${esc(direction.blurb)}</p>
      <ul class="direction-layers" aria-label="Visual layers">
        <li><b>Layout</b><span>${esc(design.name)}</span></li>
        <li><b>Imagery</b><span>${esc(art.name)}</span></li>
        <li><b>Finish</b><span>${esc(technique.name)}</span></li>
      </ul>
      ${renderInfoPopover({ id: `info-${esc(direction.id)}`, label: "Why this works", content: `<p class="direction-rationale">${esc(rationale)}</p>${learning ? `<div class="direction-learning">${learning}</div>` : ""}` })}
      <div class="card-actions">${button("btn btn-primary direction-apply")}${compareButton}</div>
    </div>
  </article>`;
}
