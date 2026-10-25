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
  readonly trendYear?: number;
  readonly principle?: string;
  readonly tradeoff?: string;
  readonly practiceTip?: string;
  readonly sourceIds?: readonly string[];
}

export const PRESETS: readonly Direction[] = [
  {
    id: "raw-human-voice",
    name: "Raw human voice",
    blurb: "Visible cuts, imperfect layers, and a clear editorial anchor.",
    formats: ["poster", "flyer", "social", "editorial"],
    goals: ["story", "bold", "attention"],
    group: "Contemporary 2026",
    curatedRank: 1.5,
    trendYear: 2026,
    principle:
      "Visible construction and controlled irregularity can make a message feel authored rather than automated.",
    tradeoff:
      "Rough layering competes with dense supporting copy, so the headline and one image should carry the first read.",
    practiceTip:
      "Keep the headline and one image as the first read; move supporting copy away from rough overlaps.",
    sourceIds: ["adobe-design-trends-2026", "behance-design-trends-2026"],
    rationale: {
      story:
        "Visible cuts and irregular layers suggest an authored account, giving found imagery a role in the story.",
      bold: "Controlled irregularity and a strong editorial headline give the statement a distinct human voice.",
      attention:
        "One image and a clear headline anchor the rough layers so the first read stays easy to find.",
    },
    patch: {
      styles: {
        design: "editorial",
        art: "dada-collage",
        technique: "halftone",
      },
      palette: [
        { hex: "#F1E8D5", name: "newsprint" },
        { hex: "#1B1B1B", name: "carbon" },
        { hex: "#D9472B", name: "tomato ink" },
      ],
      font: "style",
      fontWeight: "bold",
      fontItalic: false,
      signatures: ["variation", "material"],
    },
  },
  {
    id: "one-loud-detail",
    name: "One loud detail",
    blurb: "Generous space around one exaggerated focal point.",
    formats: ["poster", "social", "story", "album-cover"],
    goals: ["attention", "bold"],
    group: "Contemporary 2026",
    curatedRank: 2.5,
    trendYear: 2026,
    principle:
      "Generous empty space makes one exaggerated element more noticeable.",
    tradeoff: "It works poorly when many messages need equal emphasis.",
    practiceTip:
      "Exaggerate one element and let the remaining space stay quiet.",
    sourceIds: ["behance-design-trends-2026", "figma-web-trends-2026"],
    rationale: {
      attention:
        "Generous empty space isolates one exaggerated element and gives the viewer a clear first read.",
      bold: "One oversized pop-art detail makes a decisive statement because the surrounding space gives it room.",
    },
    patch: {
      styles: {
        design: "japanese-minimal",
        art: "pop-art",
        technique: "mono-accent",
      },
      palette: [
        { hex: "#F3F0E8", name: "warm white" },
        { hex: "#3157D5", name: "cobalt" },
        { hex: "#161616", name: "black" },
      ],
      font: "archivo-black",
      fontWeight: "bold",
      fontItalic: false,
      signatures: ["restraint"],
    },
  },
  {
    id: "chromatic-pulse",
    name: "Chromatic pulse",
    blurb: "Repeated geometry and deliberate color contrast set the rhythm.",
    formats: ["poster", "social", "story", "banner", "album-cover"],
    goals: ["bold", "atmosphere", "attention"],
    group: "Contemporary 2026",
    curatedRank: 3.5,
    trendYear: 2026,
    principle:
      "Repeated geometry and deliberate color contrast create rhythm without adding literal action imagery.",
    tradeoff:
      "Vibrating color and optical pattern can reduce text legibility, so text must remain limited and strongly separated.",
    practiceTip:
      "Keep the headline short and separate it from the repeating pattern.",
    sourceIds: ["figma-web-trends-2026", "behance-design-trends-2026"],
    rationale: {
      bold: "Repeated optical shapes and deliberate color contrast give a short statement force and rhythm.",
      atmosphere:
        "Color contrast and repeated geometry suggest a pulsing mood without literal action imagery.",
      attention:
        "Strong color contrast draws the eye, while separated text keeps the headline readable against the optical rhythm.",
    },
    patch: {
      styles: { design: "memphis", art: "op-art", technique: "screenprint" },
      palette: [
        { hex: "#FBE7CF", name: "peach" },
        { hex: "#FF5AA8", name: "hot pink" },
        { hex: "#139AA4", name: "teal" },
      ],
      font: "bebas",
      fontWeight: "bold",
      fontItalic: false,
      signatures: ["concept"],
    },
  },
  {
    id: "soft-surreal-tactility",
    name: "Soft surreal tactility",
    blurb: "One impossible metaphor with consistent paper, ink, and scale.",
    formats: ["poster", "book-cover", "album-cover", "editorial", "social"],
    goals: ["story", "atmosphere", "attention"],
    group: "Contemporary 2026",
    curatedRank: 4.5,
    trendYear: 2026,
    principle:
      "A single impossible metaphor feels more convincing when paper, ink, and scale behave consistently.",
    tradeoff:
      "The metaphor needs a direct connection to the subject or it becomes decorative ambiguity.",
    practiceTip:
      "Tie the impossible image to one concrete subject from the brief.",
    sourceIds: ["adobe-creative-trends-2026", "adobe-design-trends-2026"],
    rationale: {
      story:
        "One impossible metaphor tied to the subject compresses its story, while consistent materials make it believable.",
      atmosphere:
        "Consistent paper, ink, and scale give the surreal image a tactile mood the viewer can imagine touching.",
      attention:
        "A single impossible image invites a second look, while consistent material cues keep the focal point coherent.",
    },
    patch: {
      styles: {
        design: "polish-poster",
        art: "surrealism",
        technique: "letterpress",
      },
      palette: [
        { hex: "#E8E2D2", name: "chalk" },
        { hex: "#1E1E1E", name: "charcoal" },
        { hex: "#C9302C", name: "red" },
      ],
      font: "style",
      fontWeight: "regular",
      fontItalic: false,
      signatures: ["concept", "material"],
    },
  },
  {
    id: "local-cut-paper-story",
    name: "Local cut-paper story",
    blurb: "Place-specific details told through cut paper and printed ink.",
    formats: ["poster", "editorial", "social", "flyer", "book-cover"],
    goals: ["story", "atmosphere"],
    group: "Contemporary 2026",
    curatedRank: 5.5,
    trendYear: 2026,
    principle:
      "A place-specific object, pattern, or material gives a story more meaning than generic cultural decoration.",
    tradeoff:
      "The starter cannot invent local cues. The user's brief or concept must name them.",
    practiceTip: "Name a real place, material, or object from the brief.",
    sourceIds: ["adobe-creative-trends-2026", "adobe-design-trends-2026"],
    rationale: {
      story:
        "A place-specific object from the brief gives the cut-paper story a concrete subject and cultural context.",
      atmosphere:
        "Local patterns or materials named in the brief give the paper and printed ink a sense of place.",
    },
    patch: {
      styles: { design: "editorial", art: "cut-paper", technique: "risograph" },
      palette: [
        { hex: "#F2EEE8", name: "paper" },
        { hex: "#C75B3A", name: "terracotta" },
        { hex: "#315C8C", name: "cobalt" },
      ],
      font: "fraunces",
      fontWeight: "bold",
      fontItalic: false,
      signatures: ["material", "variation"],
    },
  },
  {
    id: "retro-future-grid",
    name: "Retro-future grid",
    blurb: "A stable typographic grid holds experimental optical imagery.",
    formats: ["poster", "album-cover", "social", "banner"],
    goals: ["attention", "bold", "atmosphere"],
    group: "Contemporary 2026",
    curatedRank: 6.5,
    trendYear: 2026,
    principle:
      "A strict typographic grid gives experimental optical imagery a stable reading order.",
    tradeoff:
      "The clean system can feel generic unless the central image or headline contains a specific idea.",
    practiceTip:
      "Give the central image or headline one specific idea so the grid does not feel generic.",
    sourceIds: ["figma-web-trends-2026", "dribbble-design-trends"],
    rationale: {
      attention:
        "A strict typographic grid establishes the reading order before the optical image adds visual tension.",
      bold: "Experimental optical imagery creates a strong statement while the grid keeps its headline deliberate and clear.",
      atmosphere:
        "Optical geometry and monospaced type suggest a retrofuturist mood within a stable typographic system.",
    },
    patch: {
      styles: { design: "swiss", art: "op-art", technique: "clean" },
      palette: [
        { hex: "#F1F1EC", name: "off-white" },
        { hex: "#2A52D8", name: "electric blue" },
        { hex: "#F05A30", name: "signal orange" },
      ],
      font: "plex-mono",
      fontWeight: "bold",
      fontItalic: false,
      signatures: ["concept", "restraint"],
    },
  },
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
        "Bauhaus geometry gives the headline a clear place to land, while Cubist forms create a distinct focal point.",
      atmosphere:
        "Cubist rhythm and screen-printed inks suggest syncopation and intimacy without relying on literal music symbols.",
      bold: "Large geometric forms and a tightly limited palette help the message read quickly at a distance.",
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
        "One clear focal point and generous open space make the headline easy to find.",
      atmosphere:
        "Japanese minimalism and letterpress texture make the shop feel calm, tactile, and local.",
      bold: "An oversized focal point can make a quiet, memorable statement without decorative clutter.",
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
        "Cut-paper forms invite a visual metaphor, giving the subject room to suggest a story.",
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
        "A clear geometric system and deliberate grouping help explain how parts relate to a whole.",
      attention:
        "Primary shapes and a simple hierarchy direct attention to the central idea.",
      story:
        "A close relationship between typography and geometry helps connect the headline to its subject.",
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
        "Art Nouveau's flowing lines and specimen-like imagery can give a subject a clear visual narrative.",
      atmosphere:
        "Cyanotype's blue-on-paper process gives the botanical study a quiet archival mood.",
      attention:
        "A strong directional line provides one path through the composition instead of several competing images.",
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
        "Surrealist imagery turns a complex subject into one compact visual metaphor.",
      atmosphere:
        "A painterly Polish poster treatment and linocut texture make the cover feel literary and nocturnal.",
      attention:
        "A single surreal image gives the title room and makes the central idea easier to remember.",
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
        "A strong diagonal gives the eye a clear path through the composition before it reaches supporting details.",
      bold: "Constructivist scale and directional movement create urgency without relying on generic sports imagery.",
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
        "Centered symmetry creates a clear focal point and leaves room for supporting information.",
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
        "Collage lets found forms suggest the subject, making a story visible before it is read.",
      bold: "Dada collage and halftone create a deliberately rough surface with a strong editorial headline.",
      attention:
        "A strong typographic anchor establishes the first read, while halftone supports a printed, archival feel.",
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
