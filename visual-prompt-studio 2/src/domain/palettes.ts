import type { Recipe } from "./recipe";

/** Alternative palettes offered next to the style's own. Ground, ink A, ink B. */
export const PALETTE_VARIATIONS: readonly {
  id: string;
  label: string;
  colors: Recipe["palette"];
}[] = [
  {
    id: "ink-paper",
    label: "Ink & paper",
    colors: [
      { hex: "#EDE6DA", name: "unbleached paper" },
      { hex: "#C9412F", name: "brick red" },
      { hex: "#1D1D1F", name: "press black" },
    ],
  },
  {
    id: "riso-classic",
    label: "Riso classic",
    colors: [
      { hex: "#F4F1EA", name: "white paper" },
      { hex: "#FF48B0", name: "fluorescent pink" },
      { hex: "#3D5588", name: "federal blue" },
    ],
  },
  {
    id: "cobalt",
    label: "Cobalt studio",
    colors: [
      { hex: "#E9ECEF", name: "cool grey paper" },
      { hex: "#1F48C9", name: "cobalt blue" },
      { hex: "#F06A35", name: "tangerine" },
    ],
  },
  {
    id: "botanical",
    label: "Botanical",
    colors: [
      { hex: "#EEEADF", name: "herbarium paper" },
      { hex: "#3F5E45", name: "fern green" },
      { hex: "#B97A56", name: "terracotta clay" },
    ],
  },
  {
    id: "after-dark",
    label: "After dark",
    colors: [
      { hex: "#1B1E2B", name: "night navy" },
      { hex: "#E7B34A", name: "sodium amber" },
      { hex: "#ECE6D8", name: "bone" },
    ],
  },
];

/** Small named-color table for naming custom picks. Models follow names better than hex. */
const NAMED: readonly [string, number, number, number][] = [
  ["black", 22, 22, 24],
  ["charcoal", 54, 54, 58],
  ["slate grey", 108, 117, 125],
  ["warm grey", 150, 140, 130],
  ["off-white", 242, 240, 234],
  ["cream", 240, 230, 210],
  ["sand", 214, 192, 156],
  ["ochre", 204, 142, 48],
  ["mustard", 222, 178, 52],
  ["lemon yellow", 246, 220, 60],
  ["tangerine", 240, 110, 50],
  ["vermilion", 214, 60, 40],
  ["signal red", 226, 38, 28],
  ["brick red", 170, 64, 48],
  ["burgundy", 112, 28, 44],
  ["hot pink", 255, 90, 168],
  ["dusty rose", 214, 150, 150],
  ["lilac", 186, 160, 214],
  ["violet", 112, 64, 168],
  ["navy", 28, 40, 80],
  ["ultramarine", 40, 60, 200],
  ["cobalt blue", 31, 72, 201],
  ["sky blue", 120, 180, 230],
  ["teal", 19, 154, 164],
  ["mint", 160, 220, 190],
  ["sage green", 130, 156, 120],
  ["forest green", 40, 80, 56],
  ["olive", 120, 120, 50],
  ["chocolate brown", 92, 58, 40],
  ["terracotta", 190, 100, 70],
  ["gold", 211, 169, 79],
  ["prussian blue", 22, 60, 110],
];

export function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function nameForHex(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  let best = "black";
  let bestD = Number.POSITIVE_INFINITY;
  for (const [name, R, G, B] of NAMED) {
    // Weighted RGB distance: cheap and good enough for naming.
    const d = 2 * (r - R) ** 2 + 4 * (g - G) ** 2 + 3 * (b - B) ** 2;
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  }
  return best;
}

/** Relative luminance (WCAG) for picking readable ink on a ground. */
export function luminance(hex: string): number {
  const ch = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
