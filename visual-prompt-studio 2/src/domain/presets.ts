import { DEFAULT_RECIPE, type Recipe } from "./recipe";
import {
  getStyle,
  type ArtId,
  type DesignId,
  type Palette,
  type TechniqueId,
} from "./styles";
import type { ClicheId } from "./avoids";

/** A quick start overrides only what makes it distinct; the rest comes from the default. */
export interface Preset {
  readonly id: string;
  readonly name: string;
  readonly blurb: string;
  readonly patch: Partial<Omit<Recipe, "styles">> & {
    styles: { design: DesignId; art: ArtId; technique: TechniqueId };
    cliche?: ClicheId;
  };
}

export const PRESETS: readonly Preset[] = [
  {
    id: "gallery",
    name: "Gallery opening",
    blurb: "Grid clarity and one surprising metaphor.",
    patch: {
      styles: { design: "swiss", art: "surrealism", technique: "risograph" },
    },
  },
  {
    id: "jazz",
    name: "After-hours jazz",
    blurb: "Rhythmic geometry in two decisive inks.",
    patch: {
      idea: "A poster for a late-night jazz trio residency in a basement club",
      headline: "BLUE HOURS",
      extraText: ["EVERY THURSDAY · 22:00"],
      detail: "the double bass is drawn as a stack of stepped blue rectangles",
      cliche: "concert",
      styles: { design: "bauhaus", art: "cubism", technique: "screenprint" },
    },
  },
  {
    id: "coffee",
    name: "Neighborhood coffee",
    blurb: "A single object, silence and warmth.",
    patch: {
      idea: "A poster for a small neighborhood coffee roaster opening at dawn",
      headline: "FIRST LIGHT",
      extraText: ["OPENS 07:00"],
      detail: "one cup casts a long shadow shaped like a sunrise",
      cliche: "coffee",
      styles: {
        design: "japanese-minimal",
        art: "none",
        technique: "letterpress",
      },
    },
  },
  {
    id: "festival",
    name: "Indie festival",
    blurb: "Playful culture cues without neon.",
    patch: {
      idea: "A lineup poster for a two-day independent music festival in a city park",
      headline: "PARK NOISE",
      extraText: ["12–13 JULY"],
      detail: "the stage is a giant folded paper crane",
      cliche: "festival",
      styles: { design: "memphis", art: "cut-paper", technique: "risograph" },
    },
  },
  {
    id: "museum",
    name: "Museum education",
    blurb: "Geometry that teaches instead of decorates.",
    patch: {
      idea: "A poster for a family workshop on how bridges carry weight",
      headline: "HOW BRIDGES HOLD",
      extraText: ["SATURDAYS · AGES 8+"],
      detail: "the arch is built from the letters of the headline",
      cliche: "none",
      styles: { design: "de-stijl", art: "suprematism", technique: "clean" },
    },
  },
  {
    id: "botanical",
    name: "Botanical print",
    blurb: "Historical drawing and honest printing.",
    patch: {
      idea: "A poster for a herbarium exhibition at a university garden",
      headline: "PRESSED",
      extraText: ["HORTUS BOTANICUS"],
      detail: "one fern frond unrolls across the full height of the sheet",
      styles: { design: "art-nouveau", art: "none", technique: "cyanotype" },
    },
  },
  {
    id: "book",
    name: "Literary novel",
    blurb: "A cover that holds one idea.",
    patch: {
      idea: "A cover for a literary novel about a lighthouse keeper who stops sleeping",
      purpose: "book-cover",
      aspect: "2:3",
      headline: "THE LONG WATCH",
      extraText: ["A NOVEL"],
      detail: "the lighthouse beam is a single open eyelid",
      cliche: "book-fair",
      styles: {
        design: "polish-poster",
        art: "surrealism",
        technique: "linocut",
      },
    },
  },
  {
    id: "race",
    name: "City night run",
    blurb: "Urgency without slanted sport type.",
    patch: {
      idea: "A poster for a 10 km night run through the old town",
      headline: "RUN THE WALLS",
      extraText: ["10 KM · 21:00"],
      detail: "the route of the medieval walls becomes one red diagonal",
      cliche: "race",
      styles: { design: "constructivism", art: "none", technique: "halftone" },
    },
  },
  {
    id: "gala",
    name: "Winter gala",
    blurb: "Deco elegance with optical tension.",
    patch: {
      idea: "An invitation poster for a winter fundraising gala at the city theatre",
      headline: "MIDWINTER",
      extraText: ["21 DECEMBER"],
      detail: "the theatre curtain folds into a stepped sunburst",
      styles: { design: "art-deco", art: "op-art", technique: "screenprint" },
    },
  },
  {
    id: "zine",
    name: "Culture zine",
    blurb: "Found material with a strong editorial anchor.",
    patch: {
      idea: "A cover for a local culture zine issue about forgotten shop signs",
      purpose: "book-cover",
      aspect: "3:4",
      headline: "SIGNS OF LIFE",
      extraText: ["ISSUE 07"],
      detail: "letters cut from real shop signs spell the title",
      styles: {
        design: "editorial",
        art: "dada-collage",
        technique: "halftone",
      },
    },
  },
];

/** Three-layer mixes that clash on purpose (beailabs guide, section 5). */
export const MIXES: readonly {
  name: string;
  expect: string;
  styles: Preset["patch"]["styles"];
}[] = [
  {
    name: "Constructivism × Ukiyo-e × Riso",
    expect: "Soviet diagonals over a two-ink Japanese landscape.",
    styles: {
      design: "constructivism",
      art: "ukiyo-e",
      technique: "risograph",
    },
  },
  {
    name: "Swiss × Surrealism × Cyanotype",
    expect: "A perfect grid holding a blue dream scene.",
    styles: { design: "swiss", art: "surrealism", technique: "cyanotype" },
  },
  {
    name: "Japanese Minimal × Pop × Etching",
    expect: "Vast emptiness, one comic element, an old engraved finish.",
    styles: {
      design: "japanese-minimal",
      art: "pop-art",
      technique: "etching",
    },
  },
  {
    name: "Art Deco × Op Art × Screen print",
    expect: "Stepped elegance that vibrates.",
    styles: { design: "art-deco", art: "op-art", technique: "screenprint" },
  },
  {
    name: "Memphis × Surrealism × Halftone",
    expect: "80s confetti meets dream logic. The most absurd.",
    styles: { design: "memphis", art: "surrealism", technique: "halftone" },
  },
];

export function applyPreset(base: Recipe, preset: Preset): Recipe {
  const { styles, ...rest } = preset.patch;
  const design = getStyle(styles.design);
  return {
    ...DEFAULT_RECIPE,
    target: base.target,
    pattern: base.pattern,
    language: base.language,
    midjourney: base.midjourney,
    ...rest,
    styles,
    palette: design.palette ? clonePalette(design.palette) : base.palette,
  };
}

export function clonePalette(p: Palette): Recipe["palette"] {
  return [
    { hex: p[0].hex, name: p[0].name },
    { hex: p[1].hex, name: p[1].name },
    { hex: p[2].hex, name: p[2].name },
  ];
}
