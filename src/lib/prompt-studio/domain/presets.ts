import { DEFAULT_RECIPE, type Recipe } from "./recipe";
import {
  getStyle,
  type ArtId,
  type DesignId,
  type Palette,
  type TechniqueId,
} from "./styles";
import type { ClicheId } from "./avoids";
import type { PurposeId } from "./recipe";
import type { GoalId } from "./discovery";

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

export interface Direction extends Preset {
  readonly formats: readonly PurposeId[];
  readonly goals: readonly GoalId[];
  readonly group: string;
  readonly rationale: Readonly<Partial<Record<GoalId, string>>>;
  /** Editorial ordering only. This does not represent user activity. */
  readonly curatedRank?: number;
}

export const PRESETS: readonly Direction[] = [
  {
    id: "gallery",
    name: "Gallery opening",
    blurb: "Grid clarity and one surprising metaphor.",
    formats: ["poster", "social", "editorial"],
    goals: ["attention", "story", "atmosphere"],
    group: "Culture and events",
    curatedRank: 3,
    rationale: {
      attention:
        "A strict grid keeps the event details legible while surreal imagery gives the eye one unexpected focal point.",
      story:
        "A surreal metaphor invites viewers to pause and interpret the exhibition rather than rely on a familiar art icon.",
      atmosphere:
        "Risograph color and one dreamlike image make the gallery feel experimental without crowding the layout.",
    },
    patch: {
      styles: { design: "swiss", art: "surrealism", technique: "risograph" },
    },
  },
  {
    id: "jazz",
    name: "After-hours jazz",
    blurb: "Rhythmic geometry in two decisive inks.",
    formats: ["poster", "flyer", "album-cover", "social", "story"],
    goals: ["attention", "atmosphere", "bold"],
    group: "Culture and events",
    curatedRank: 1,
    rationale: {
      attention:
        "Bauhaus geometry gives the headline a clear place to land, and the stepped bass image creates a distinct focal point.",
      atmosphere:
        "Cubist rhythm and screen-printed inks suggest the syncopation and intimacy of a late-night set.",
      bold: "Large geometric forms and a tightly limited palette make the event read quickly at a distance.",
    },
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
    formats: ["poster", "flyer", "social", "story", "banner"],
    goals: ["attention", "atmosphere", "bold"],
    group: "Products and places",
    curatedRank: 2,
    rationale: {
      attention:
        "One cup and its long shadow give the eye a single focal point, while the open space keeps the opening time easy to find.",
      atmosphere:
        "Japanese minimalism and letterpress texture make the shop feel calm, tactile, and local.",
      bold: "A single oversized object can make a quiet, memorable statement without adding decorative clutter.",
    },
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
    formats: ["poster", "flyer", "social", "story", "banner"],
    goals: ["story", "atmosphere", "bold"],
    group: "Culture and events",
    curatedRank: 4,
    rationale: {
      story:
        "The paper-crane stage turns the festival setting into a visual metaphor that gives the lineup a story.",
      atmosphere:
        "Cut-paper shapes and risograph inks bring a handmade, communal mood to the event.",
      bold: "Memphis shapes create high contrast and playful movement without leaning on the usual neon concert look.",
    },
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
    formats: ["poster", "flyer", "social", "editorial"],
    goals: ["explain", "attention", "story"],
    group: "Learning and information",
    curatedRank: 5,
    rationale: {
      explain:
        "A clear geometric system makes the bridge's structure the lesson, and the arch-shaped headline links the words to the idea.",
      attention:
        "Primary shapes and a simple hierarchy direct attention to the central engineering concept.",
      story:
        "The arch formed from the headline connects a familiar structure to the question of how bridges hold weight.",
    },
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
    formats: ["poster", "editorial", "social"],
    goals: ["story", "atmosphere", "attention"],
    group: "Learning and information",
    rationale: {
      story:
        "One unfolding fern gives the exhibition a clear visual narrative, from a closed frond to a full specimen.",
      atmosphere:
        "Cyanotype's blue-on-paper process gives the botanical study a quiet archival mood.",
      attention:
        "The long fern frond provides one strong path through the poster instead of several competing images.",
    },
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
    formats: ["book-cover", "social"],
    goals: ["story", "atmosphere", "attention"],
    group: "Books and editorial",
    curatedRank: 6,
    rationale: {
      story:
        "The lighthouse beam becoming an eyelid turns the novel's premise into one compact visual metaphor.",
      atmosphere:
        "A painterly Polish poster treatment and linocut texture make the cover feel literary and nocturnal.",
      attention:
        "A single surreal image gives the title room and makes the book's central tension easy to remember.",
    },
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
    formats: ["poster", "flyer", "social", "story", "banner"],
    goals: ["attention", "bold"],
    group: "Culture and events",
    rationale: {
      attention:
        "The route becomes one red diagonal, so the eye moves through the city before it reaches the event details.",
      bold: "Constructivist scale and a single red route give the race urgency without relying on generic running figures.",
    },
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
    formats: ["poster", "flyer", "social", "banner"],
    goals: ["atmosphere", "attention", "bold"],
    group: "Culture and events",
    rationale: {
      atmosphere:
        "Art Deco symmetry, stepped forms, and screen-printed inks give the invitation a formal winter mood.",
      attention:
        "The centered sunburst creates a clear focal point and leaves room for the date.",
      bold: "Optical geometry gives the formal event a sharper visual character than a conventional gold flourish.",
    },
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
    formats: ["book-cover", "editorial", "social"],
    goals: ["story", "bold", "attention"],
    group: "Books and editorial",
    rationale: {
      story:
        "Found shop lettering turns the subject into the cover itself, making the story visible before it is read.",
      bold: "Dada collage and halftone create a deliberately rough surface with a strong editorial headline.",
      attention:
        "Oversized found letters establish the first read, while the halftone finish supports the local archive feel.",
    },
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

export const DIRECTIONS = PRESETS;

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
