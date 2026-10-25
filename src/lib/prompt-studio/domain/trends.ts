export interface TrendEdition {
  readonly year: number;
  readonly label: string;
  readonly description: string;
  readonly checked: string;
  readonly directionIds: readonly string[];
}

export const TREND_EDITIONS: readonly TrendEdition[] = [
  {
    year: 2026,
    label: "2026 starters",
    description:
      "Six source-grounded editorial directions; not popularity evidence.",
    checked: "2026-10-25",
    directionIds: [
      "raw-human-voice",
      "one-loud-detail",
      "chromatic-pulse",
      "soft-surreal-tactility",
      "local-cut-paper-story",
      "retro-future-grid",
    ],
  },
];

export const CURRENT_TREND_EDITION = TREND_EDITIONS[0]!;

const editionsByYear = new Map(
  TREND_EDITIONS.map((edition) => [edition.year, edition]),
);

export function getTrendEdition(year: number): TrendEdition | undefined {
  return editionsByYear.get(year);
}
