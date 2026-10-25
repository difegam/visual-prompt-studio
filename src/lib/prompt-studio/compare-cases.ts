import type { ImageMetadata } from "astro";
import generic from "@/assets/compare/generic.jpg";
import japaneseLetterpress from "@/assets/compare/japanese-letterpress.jpg";
import dadaHalftone from "@/assets/compare/dada-halftone.jpg";
import popOffset from "@/assets/compare/pop-offset.jpg";
import swissRiso from "@/assets/compare/swiss-riso.jpg";
import constructivistHalftone from "@/assets/compare/constructivist-halftone.jpg";

export interface ComparePalette {
  readonly name: string;
  readonly hex: string;
}

export interface CompareCase {
  readonly id: string;
  /** The three style layers the prompt was built from. `null` means the layer was left unset. */
  readonly layers: {
    readonly layout: string;
    readonly imagery: string | null;
    readonly finish: string;
  };
  /** Named Studio direction with the same layers, when one exists. */
  readonly directionName?: string;
  readonly image: ImageMetadata;
  readonly alt: string;
  readonly palette: readonly ComparePalette[];
  readonly typography: string;
  readonly text: readonly string[];
  readonly avoid: readonly string[];
  /** What the model did with the prompt, judged from the image. */
  readonly changes: readonly string[];
  /** Set when the prompt differs from the other four in a way worth explaining. */
  readonly caveat?: string;
  readonly prompt: string;
}

export const GENERIC_CASE = {
  image: generic,
  alt: "Halloween poster with a glowing orange title, carved pumpkins, a full moon and children trick-or-treating on a lamplit street.",
  prompt: `Make a poster: A Halloween event in our neighborhood. The title is "Halloween in Amby"
Include the date and time: "October 31 @ 18:00"
Include the location: "Amby"`,
  guesses: [
    "Style: the model fell back on the most common Halloween look.",
    "Palette: orange, purple and black, with glow and gradients.",
    "Type: a decorated display face with swirls, bats and webs.",
    "Composition: a busy scene with the title floating on top.",
    "Finish: a glossy digital render.",
  ],
} as const;

const SHARED_AVOID = [
  "classical marble busts",
  "gold leaf",
  "paint splashes",
  "dry brush strokes behind or under the text",
  "comic-style speed lines",
  "small decorative rays radiating from words or objects",
  "brush-stroke underlines below the headline",
  "glossy 3D rendering or plastic sheen",
  "any words, taglines or slogans not listed in the exact text",
  "watermarks, signatures or invented logos",
] as const;

const EXACT_TEXT = ["Halloween in Amby", "Octuber 31 @ 18:00", "Amby"] as const;

export const CASES: readonly CompareCase[] = [
  {
    id: "japanese-letterpress",
    layers: {
      layout: "Japanese minimal",
      imagery: null,
      finish: "Letterpress",
    },
    directionName: "Neighborhood coffee",
    image: japaneseLetterpress,
    alt: "Quiet poster on washi-white paper: a huge vermilion moon, a black cat on a roof edge, and small widely spaced serif type at the left.",
    palette: [
      { name: "Washi white", hex: "#F3F0EA" },
      { name: "Vermilion", hex: "#C23B2E" },
      { name: "Sumi black", hex: "#202020" },
    ],
    typography: "Small, widely spaced serif or mincho-style type, bold weight.",
    text: EXACT_TEXT,
    avoid: SHARED_AVOID,
    changes: [
      "The prompt asks for “a single focal element”, so the model drew one moon and one cat instead of a crowded street.",
      "Three named colours replace the generic glow. Even the cat and the roof stay in sumi black.",
      "“Ink pressed into thick cotton paper” gives the visible grain and the slight impression you see in the type.",
    ],
    prompt: `Create a portrait 4:5 poster: a Halloween event in our neighborhood. Art direction: Japanese minimal poster layout: vast empty space, a single focal element, quiet asymmetry, small refined typography; letterpress finish: ink pressed into thick cotton paper, slight impression and small honest imperfections. Typography: small, widely spaced refined serif or mincho-style type, a bold weight. Palette: washi white (#F3F0EA), vermilion (#C23B2E) and sumi black (#202020), no other colors. Render exactly this text: "Halloween in Amby", "Octuber 31 @ 18:00", "Amby", and no other text. Allow small handmade irregularities, never random noise. Make inks, paper and light behave realistically. Avoid: ${SHARED_AVOID.join("; ")}.`,
  },
  {
    id: "dada-halftone",
    layers: {
      layout: "Editorial",
      imagery: "Dada collage",
      finish: "Halftone",
    },
    directionName: "Culture zine",
    image: dadaHalftone,
    alt: "Collage poster of torn newsprint: ransom-note lettering spells the title above a ghost holding a jack-o'-lantern, all in cream, black and tomato red.",
    palette: [
      { name: "Newsprint", hex: "#F1E8D5" },
      { name: "Carbon", hex: "#1B1B1B" },
      { name: "Tomato ink", hex: "#D9472B" },
    ],
    typography: "The style's own lettering (Dada collage), bold weight.",
    text: EXACT_TEXT,
    avoid: SHARED_AVOID,
    changes: [
      "“Ransom-note lettering” turned each letter into its own torn clipping, so the type is part of the image.",
      "The same subject, Halloween, now reads through a ghost and a pumpkin cut from a photograph.",
      "“Visible dot screen on off-white newsprint” adds the halftone texture across every shape.",
    ],
    prompt: `Create a portrait 4:5 poster: a Halloween event in our neighborhood. Art direction: contemporary editorial layout: very large display headline, serif and sans-serif pairing, image-led composition with measured rhythm; Dada collage imagery: torn photographic fragments, cut newsprint, chance arrangements, ransom-note lettering; halftone finish: visible dot screen printed on off-white newsprint. Typography: the style's own lettering (Dada Collage), a bold weight. Palette: newsprint (#F1E8D5), carbon (#1B1B1B) and tomato ink (#D9472B), no other colors. Render exactly this text: "Halloween in Amby", "Octuber 31 @ 18:00", "Amby", and no other text. Allow small handmade irregularities, never random noise. Make inks, paper and light behave realistically. Avoid: ${SHARED_AVOID.join("; ")}.`,
  },
  {
    id: "pop-offset",
    layers: {
      layout: "Japanese minimal",
      imagery: "Pop art",
      finish: "Two-color offset",
    },
    image: popOffset,
    alt: "Off-white poster with a black ultra-heavy title at the left and a cobalt blue haunted house with a jack-o'-lantern face at the lower right.",
    palette: [
      { name: "White", hex: "#F2F1EE" },
      { name: "Cobalt", hex: "#3157D5" },
      { name: "Black", hex: "#151515" },
    ],
    typography: "An ultra-heavy grotesque sans-serif.",
    text: EXACT_TEXT,
    avoid: [
      ...SHARED_AVOID.slice(0, 3),
      "distressed or grunge texture on letters and shapes",
      ...SHARED_AVOID.slice(3),
    ],
    changes: [
      "Same layout layer as the letterpress poster, different imagery and finish, so the result looks nothing like it.",
      "“Everything in black and white except a single accent colour” gave one cobalt object and a lot of paper.",
      "“Keep only elements that earn their place” kept the house and the three text lines, and nothing else.",
    ],
    prompt: `Create a portrait 4:5 poster: a Halloween event in our neighborhood. Art direction: Japanese minimal poster layout: vast empty space, a single focal element, quiet asymmetry, small refined typography; pop art imagery: Ben-Day dots, flat saturated color fields, bold black contour lines; two-color offset finish: everything in black and white except a single accent color. Typography: an ultra-heavy grotesque sans-serif. Palette: white (#F2F1EE), cobalt (#3157D5) and black (#151515), no other colors. Render exactly this text: "Halloween in Amby", "Octuber 31 @ 18:00", "Amby", and no other text. Keep only elements that earn their place; leave real breathing room. Avoid: classical marble busts; gold leaf; paint splashes; distressed or grunge texture on letters and shapes; ${SHARED_AVOID.slice(3).join("; ")}.`,
  },
  {
    id: "swiss-riso",
    layers: {
      layout: "Swiss International",
      imagery: "Surrealism",
      finish: "Risograph",
    },
    directionName: "Gallery opening",
    image: swissRiso,
    alt: "Poster with a huge red flush-left title above a giant red jack-o'-lantern moon floating over a quiet row of suburban houses.",
    palette: [
      { name: "Off-white", hex: "#F1F1EC" },
      { name: "Signal red", hex: "#E2261C" },
      { name: "Black", hex: "#16181B" },
    ],
    typography:
      "A neutral grotesque sans-serif, flush left, with strong scale contrast.",
    text: EXACT_TEXT,
    avoid: SHARED_AVOID,
    changes: [
      "“One deliberate dream-logic juxtaposition, impossible scale” became a pumpkin the size of the sky over an ordinary street.",
      "Strong scale contrast in the type gives a clear order: title first, then date, then place.",
      "Two flat inks plus visible grain make the red read like a riso layer, not a gradient.",
    ],
    prompt: `Create a portrait 4:5 poster: a Halloween event in our neighborhood. Art direction: Swiss International Typographic Style layout: asymmetric modular grid, flush-left ragged-right text, strong typographic hierarchy, generous negative space; surrealist imagery in the manner of a 1930s oil painting: one deliberate dream-logic juxtaposition, impossible scale made visually coherent; risograph print finish: two or three flat spot inks, visible ink grain, slightly misregistered layers, uncoated paper. Typography: a neutral grotesque sans-serif, flush left, with strong scale contrast. Palette: off-white (#F1F1EC), signal red (#E2261C) and black (#16181B), no other colors. Render exactly this text: "Halloween in Amby", "Octuber 31 @ 18:00", "Amby", and no other text. Lead with one clear visual metaphor tied directly to the subject. Avoid: ${SHARED_AVOID.join("; ")}.`,
  },
  {
    id: "constructivist-halftone",
    layers: {
      layout: "Constructivism",
      imagery: null,
      finish: "Halftone",
    },
    directionName: "City night run",
    image: constructivistHalftone,
    alt: "Constructivist poster: a stepped red and black tower under a pale moon, with the title set on a steep diagonal band across the lower half.",
    palette: [
      { name: "Unbleached paper", hex: "#EDE6DA" },
      { name: "Brick red", hex: "#C9412F" },
      { name: "Press black", hex: "#1D1D1F" },
    ],
    typography: "Heavy condensed sans-serif lettering set on diagonals.",
    text: ["Halloween in Amby", "October 31 at 22:00"],
    avoid: [
      "yellow spotlight",
      "microphone",
      "black background",
      "music notes",
      "dry brush strokes behind or under the text",
      "comic-style speed lines",
      "small decorative rays radiating from words or objects",
      "brush-stroke underlines below the headline",
      "glossy 3D rendering or plastic sheen",
      "any words, taglines or slogans not listed in the exact text",
      "watermarks, signatures or invented logos",
    ],
    changes: [
      "“Forceful diagonal composition” moved the title onto a slanted band and tilted the whole scene.",
      "The concept asked for stepped blue rectangles, but the palette allows only paper, red and black. The model kept the stepped shape as a tower and followed the palette, so a hard colour limit wins over a loose concept.",
      "Only two text lines were requested, so the venue line is missing.",
    ],
    caveat:
      "This prompt is a different brief: a 3:4 banner, two text lines, a “stepped rectangles” concept and its own avoid list. Read it as another example of the same method, not as a like-for-like comparison with the generic poster.",
    prompt: `Create a portrait 3:4 wide event banner: a poster for a Halloween event in our neighborhood. Concept: the double bass is drawn as a stack of stepped blue rectangles. Art direction: Constructivist layout: forceful diagonal composition, oversized condensed lettering, red and black blocks, photomontage logic, graphic urgency; halftone finish: visible dot screen printed on off-white newsprint. Typography: heavy condensed sans-serif lettering set on diagonals. Palette: unbleached paper (#EDE6DA), brick red (#C9412F) and press black (#1D1D1F), no other colors. Render exactly this text: "Halloween in Amby", "October 31 at 22:00", and no other text. Lead with one clear visual metaphor tied directly to the subject. Avoid: yellow spotlight; microphone; black background; music notes; dry brush strokes behind or under the text; comic-style speed lines; small decorative rays radiating from words or objects; brush-stroke underlines below the headline; glossy 3D rendering or plastic sheen; any words, taglines or slogans not listed in the exact text; watermarks, signatures or invented logos.`,
  },
];

export const TYPO_NOTE =
  "The prompts for the first four directions spell “October” as “Octuber”. The model drew “October” anyway. That is luck, not a feature: check the spelling of every word you ask a model to render.";
