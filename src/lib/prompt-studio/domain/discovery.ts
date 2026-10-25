import {
  getStyle,
  stylesOf,
  type BrowsableStyle,
  type StyleLayer,
} from "./styles";
import { DIRECTIONS, clonePalette, type Direction } from "./presets";
import { PURPOSES, type PurposeId, type Recipe } from "./recipe";
import { getReference } from "./references";

export const GOALS = [
  {
    id: "attention",
    label: "Focus attention",
    principle: "Focus the eye",
    description:
      "Give the viewer one clear place to look first, then keep the supporting information easy to scan.",
  },
  {
    id: "story",
    label: "Tell a story",
    principle: "Tell a story",
    description:
      "Use a visual metaphor or moment that makes the viewer curious about what happened or what comes next.",
  },
  {
    id: "explain",
    label: "Explain clearly",
    principle: "Make a system",
    description:
      "Use clear grouping and hierarchy so the image helps people understand information quickly.",
  },
  {
    id: "atmosphere",
    label: "Set a mood",
    principle: "Use color, scale, and texture",
    description:
      "Choose visual cues that establish a feeling and keep the message consistent with it.",
  },
  {
    id: "bold",
    label: "Make a bold statement",
    principle: "Amplify",
    description:
      "Use scale, contrast, or a strong diagonal to make the message feel urgent and hard to miss.",
  },
] as const;

export type GoalId = (typeof GOALS)[number]["id"];

export interface DirectionFilters {
  readonly query?: string;
  readonly format?: PurposeId | "all";
  readonly goal?: GoalId | "all";
  readonly styleId?: string | "all";
  readonly group?: string | "all";
  readonly curatedOnly?: boolean;
  readonly trendYear?: number | "all";
}

export interface StyleFilters {
  readonly query?: string;
  readonly group?: string | "all";
  readonly curatedOnly?: boolean;
}

export interface Page<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly pageCount: number;
  readonly total: number;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}

function curatedOrder<T extends { readonly curatedRank?: number }>(
  a: T,
  b: T,
): number {
  return (
    (a.curatedRank ?? Number.MAX_SAFE_INTEGER) -
    (b.curatedRank ?? Number.MAX_SAFE_INTEGER)
  );
}

export function getRecommendations(
  format: PurposeId,
  goal: GoalId,
  limit = 3,
): readonly Direction[] {
  const compare = (a: Direction, b: Direction) =>
    curatedOrder(a, b) || a.name.localeCompare(b.name);
  const exact = DIRECTIONS.filter(
    (direction) =>
      direction.formats.includes(format) && direction.goals.includes(goal),
  ).sort(compare);
  const sameGoal = DIRECTIONS.filter((direction) =>
    direction.goals.includes(goal),
  ).sort(compare);
  const sameFormat = DIRECTIONS.filter((direction) =>
    direction.formats.includes(format),
  ).sort(compare);
  const rest = [...DIRECTIONS].sort(compare);
  const ordered = [
    ...new Map(
      [...exact, ...sameGoal, ...sameFormat, ...rest].map((direction) => [
        direction.id,
        direction,
      ]),
    ).values(),
  ];
  const count = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 3;
  return ordered.slice(0, count);
}

function directionSearchText(direction: Direction): string {
  const formatLabels = PURPOSES.filter((purpose) =>
    direction.formats.includes(purpose.id),
  ).map((purpose) => purpose.label);
  const goalLabels = GOALS.filter((goal) =>
    direction.goals.includes(goal.id),
  ).map((goal) => `${goal.label} ${goal.principle} ${goal.description}`);
  const styleText = Object.values(direction.patch.styles)
    .map((id) => {
      const style = getStyle(id);
      return `${style.name} ${style.era} ${style.summary} ${style.keywords}`;
    })
    .join(" ");
  const sourceNames = (direction.sourceIds ?? [])
    .map((id) => getReference(id)?.name ?? "")
    .join(" ");
  return normalize(
    `${direction.name} ${direction.blurb} ${direction.group} ${formatLabels.join(" ")} ${goalLabels.join(" ")} ${styleText} ${direction.principle ?? ""} ${direction.tradeoff ?? ""} ${sourceNames}`,
  );
}

export function filterDirections(
  directions: readonly Direction[],
  filters: DirectionFilters,
): readonly Direction[] {
  const query = normalize(filters.query ?? "");
  return directions.filter((direction) => {
    if (
      typeof filters.trendYear === "number" &&
      direction.trendYear !== filters.trendYear
    )
      return false;
    if (query && !directionSearchText(direction).includes(query)) return false;
    if (
      filters.format &&
      filters.format !== "all" &&
      !direction.formats.includes(filters.format)
    )
      return false;
    if (
      filters.goal &&
      filters.goal !== "all" &&
      !direction.goals.includes(filters.goal)
    )
      return false;
    if (
      filters.styleId &&
      filters.styleId !== "all" &&
      !Object.values(direction.patch.styles).some(
        (styleId) => styleId === filters.styleId,
      )
    )
      return false;
    if (
      filters.group &&
      filters.group !== "all" &&
      direction.group !== filters.group
    )
      return false;
    if (filters.curatedOnly && direction.curatedRank === undefined)
      return false;
    return true;
  });
}

function styleSearchText(style: BrowsableStyle): string {
  return normalize(
    `${style.id} ${style.name} ${style.era} ${style.summary} ${style.group} ${style.searchTerms.join(" ")} ${style.keywords}`,
  );
}

export function filterStyles(
  styles: readonly BrowsableStyle[],
  filters: StyleFilters,
): readonly BrowsableStyle[] {
  const query = normalize(filters.query ?? "");
  return styles.filter((style) => {
    if (query && !styleSearchText(style).includes(query)) return false;
    if (
      filters.group &&
      filters.group !== "all" &&
      style.group !== filters.group
    )
      return false;
    if (filters.curatedOnly && !style.curated) return false;
    return true;
  });
}

export function stylesInGroup(
  layer: StyleLayer,
  group: string | "all",
): readonly BrowsableStyle[] {
  return filterStyles(stylesOf(layer), { group });
}

export function paginateItems<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): Page<T> {
  const size = Number.isFinite(pageSize)
    ? Math.max(1, Math.floor(pageSize))
    : 1;
  const pageCount = Math.ceil(items.length / size);
  const requestedPage = Number.isFinite(page) ? Math.floor(page) : 1;
  const currentPage =
    pageCount === 0 ? 1 : Math.min(pageCount, Math.max(1, requestedPage));
  const start = (currentPage - 1) * size;
  return {
    items: items.slice(start, start + size),
    page: currentPage,
    pageCount,
    total: items.length,
  };
}

export function applyDirection(current: Recipe, direction: Direction): Recipe {
  const patch = direction.patch;
  const design = getStyle(patch.styles.design);
  return {
    ...current,
    styles: { ...patch.styles },
    palette: patch.palette
      ? [
          { ...patch.palette[0] },
          { ...patch.palette[1] },
          { ...patch.palette[2] },
        ]
      : design.palette
        ? clonePalette(design.palette)
        : current.palette,
    font: patch.font ?? current.font,
    fontWeight: patch.fontWeight ?? current.fontWeight,
    fontItalic: patch.fontItalic ?? current.fontItalic,
    signatures: [...(patch.signatures ?? current.signatures)],
  };
}
