/**
 * Style catalog, split by the layer each style controls:
 *   design    → layout, hierarchy, typography system
 *   art       → how forms and images are drawn
 *   technique → finish: inks, grain, paper, reproduction
 *
 * Provenance: names and the three-layer split follow the beailabs guide
 * ("Guía de estilos y generación de carteles", Sept 2026), whose catalog is based on
 * John Hartnup's "Poster Prompts". Descriptions and prompt fragments are original.
 */

export type StyleLayer = "design" | "art" | "technique";

/** Facts about a style that change how the compiler treats other inputs. */
export type StyleTrait =
  | "ownLettering" // style carries its own lettering: don't impose a font
  | "ownTexture" // grain/paper/ink texture is part of the style
  | "misregistered" // slight layer offset is intended
  | "fixedPalette"; // the technique dictates the palette

export interface PaletteColor {
  readonly hex: `#${string}`;
  readonly name: string;
}

/** Three-color palette: ground, primary ink, secondary ink. */
export type Palette = readonly [PaletteColor, PaletteColor, PaletteColor];

export interface StyleDef {
  readonly id: string;
  readonly layer: StyleLayer;
  readonly name: string;
  readonly nameEs: string;
  readonly era: string;
  readonly summary: string;
  /** Natural-language fragment for text models (GPT Image, FLUX, generic). */
  readonly prompt: string;
  /** Short keyword fragment for Midjourney / SDXL. */
  readonly keywords: string;
  /** Typography description used when "let the style decide" is selected (design layer). */
  readonly typeHint?: string;
  readonly palette?: Palette;
  readonly traits: readonly StyleTrait[];
  /** Specimen font that best previews this style, if any. */
  readonly fontId?: string;
  /** Search and browse metadata, not sent to image models. */
  readonly searchTerms?: readonly string[];
  readonly group?: string;
  readonly curated?: boolean;
}

export type BrowsableStyle = StyleDef & {
  readonly searchTerms: readonly string[];
  readonly group: string;
  readonly curated: boolean;
};

const c = (hex: `#${string}`, name: string): PaletteColor => ({ hex, name });

const STYLE_DEFINITIONS = [
  // ── Design movements ────────────────────────────────────────────────
  {
    id: "swiss",
    layer: "design",
    name: "Swiss International",
    nameEs: "Estilo tipográfico internacional (Swiss)",
    era: "1950s–60s · Switzerland",
    summary: "Strict grid, grotesque type, generous white space.",
    prompt:
      "Swiss International Typographic Style layout: asymmetric modular grid, flush-left ragged-right text, strong typographic hierarchy, generous negative space",
    keywords:
      "Swiss International Typographic Style, modular grid, flush-left grotesque type",
    typeHint:
      "a neutral grotesque sans-serif, flush left, with strong scale contrast",
    palette: [
      c("#F1F1EC", "off-white"),
      c("#E2261C", "signal red"),
      c("#16181B", "black"),
    ],
    traits: [],
    fontId: "inter",
  },
  {
    id: "bauhaus",
    layer: "design",
    name: "Bauhaus",
    nameEs: "Bauhaus",
    era: "1919–1933 · Germany",
    summary: "Circle, square, triangle; primaries; form follows function.",
    prompt:
      "Bauhaus layout: composition built from circles, squares and triangles, functional typography, primary colors, no ornament",
    keywords: "Bauhaus poster, primary geometric shapes, functional typography",
    typeHint: "a geometric sans-serif set in clear functional blocks",
    palette: [
      c("#EFE8DA", "cream paper"),
      c("#D8382B", "primary red"),
      c("#1F4FA3", "primary blue"),
    ],
    traits: [],
    fontId: "josefin",
  },
  {
    id: "constructivism",
    layer: "design",
    name: "Constructivism",
    nameEs: "Constructivismo",
    era: "1920s · Russia",
    summary: "Aggressive diagonals, red and black, huge type.",
    prompt:
      "Constructivist layout: forceful diagonal composition, oversized condensed lettering, red and black blocks, photomontage logic, graphic urgency",
    keywords: "Russian Constructivist poster, bold diagonals, red and black",
    typeHint: "heavy condensed sans-serif lettering set on diagonals",
    palette: [
      c("#ECE3D0", "cream"),
      c("#C8262B", "constructivist red"),
      c("#161616", "black"),
    ],
    traits: [],
    fontId: "oswald",
  },
  {
    id: "de-stijl",
    layer: "design",
    name: "De Stijl",
    nameEs: "De Stijl",
    era: "1917–1931 · Netherlands",
    summary: "Orthogonal black rules with primary blocks.",
    prompt:
      "De Stijl layout: orthogonal grid of thick black rules enclosing flat blocks of red, yellow and blue, strict horizontals and verticals",
    keywords:
      "De Stijl, Mondrian grid, thick black lines, primary color blocks",
    typeHint: "a square-set sans-serif aligned to the grid lines",
    palette: [
      c("#F4F2EC", "white"),
      c("#E03A2F", "red"),
      c("#F2C230", "yellow"),
    ],
    traits: [],
    fontId: "josefin",
  },
  {
    id: "art-deco",
    layer: "design",
    name: "Art Deco",
    nameEs: "Art déco",
    era: "1920s–30s · France / US",
    summary: "Stepped forms, sunbursts, elegant geometry.",
    prompt:
      "Art Deco layout: symmetrical stepped architecture, sunburst geometry, elongated display lettering, gold-on-dark elegance",
    keywords:
      "Art Deco poster, stepped geometry, sunburst, elegant display lettering",
    typeHint: "tall high-contrast Art Deco display lettering",
    palette: [
      c("#1B2330", "midnight navy"),
      c("#D3A94F", "brass gold"),
      c("#E9DFC7", "ivory"),
    ],
    traits: [],
    fontId: "limelight",
  },
  {
    id: "art-nouveau",
    layer: "design",
    name: "Art Nouveau",
    nameEs: "Art Nouveau",
    era: "1890–1910 · Europe",
    summary: "Whiplash curves, botanical frames, hand-drawn lettering.",
    prompt:
      "Art Nouveau layout: flowing whiplash curves, botanical ornamental frame, hand-drawn organic lettering integrated into the composition",
    keywords: "Art Nouveau poster, Mucha-like ornamental frame, organic curves",
    typeHint: "the style's own hand-drawn organic lettering",
    palette: [
      c("#EADFC4", "parchment"),
      c("#4E6B4A", "sage green"),
      c("#B4572E", "rust"),
    ],
    traits: ["ownLettering"],
    fontId: "cormorant",
  },
  {
    id: "memphis",
    layer: "design",
    name: "Memphis",
    nameEs: "Memphis",
    era: "1980s · Italy",
    summary: "Squiggles, confetti geometry, colors that clash on purpose.",
    prompt:
      "Memphis Group layout: playful geometric confetti, squiggles and zigzags, tilted text blocks, deliberately clashing colors",
    keywords: "Memphis design, 80s postmodern, squiggles, confetti shapes",
    typeHint: "chunky condensed display type on tilted color blocks",
    palette: [
      c("#FBE7CF", "peach"),
      c("#FF5AA8", "hot pink"),
      c("#139AA4", "teal"),
    ],
    traits: [],
    fontId: "bebas",
  },
  {
    id: "japanese-minimal",
    layer: "design",
    name: "Japanese Minimal",
    nameEs: "Minimalismo japonés",
    era: "Modern · Japan",
    summary: "Vast emptiness, one element, quiet asymmetry.",
    prompt:
      "Japanese minimal poster layout: vast empty space, a single focal element, quiet asymmetry, small refined typography",
    keywords: "Japanese minimal poster, ma negative space, single element",
    typeHint: "small, widely spaced refined serif or mincho-style type",
    palette: [
      c("#F3F0EA", "washi white"),
      c("#C23B2E", "vermilion"),
      c("#202020", "sumi black"),
    ],
    traits: [],
    fontId: "shippori",
  },
  {
    id: "editorial",
    layer: "design",
    name: "Contemporary Editorial",
    nameEs: "Editorial contemporáneo",
    era: "Current · global",
    summary: "Magazine-scale headline, serif and sans mix.",
    prompt:
      "contemporary editorial layout: very large display headline, serif and sans-serif pairing, image-led composition with measured rhythm",
    keywords: "contemporary editorial magazine layout, large serif headline",
    typeHint:
      "a large high-contrast editorial serif paired with a small sans-serif",
    palette: [
      c("#F2EEE8", "paper"),
      c("#2F3E5C", "ink blue"),
      c("#D9643A", "orange"),
    ],
    traits: [],
    fontId: "fraunces",
  },
  {
    id: "polish-poster",
    layer: "design",
    name: "Polish Poster School",
    nameEs: "Escuela Polaca del Cartel",
    era: "1950s–70s · Poland",
    summary:
      "One painted metaphor; hand lettering; image means something else.",
    prompt:
      "Polish Poster School approach: a single painterly visual metaphor that stands for the subject, loose hand-drawn lettering, image and text fused",
    keywords: "Polish Poster School, painterly visual metaphor, hand lettering",
    typeHint: "the style's own loose hand lettering",
    palette: [
      c("#E8E2D2", "chalk"),
      c("#1E1E1E", "charcoal"),
      c("#C9302C", "red"),
    ],
    traits: ["ownLettering"],
  },

  // ── Art movements ───────────────────────────────────────────────────
  {
    id: "none",
    layer: "art",
    name: "Let the layout lead",
    nameEs: "Sin movimiento artístico",
    era: "No extra imagery layer",
    summary: "Imagery follows the design movement.",
    prompt: "",
    keywords: "",
    traits: [],
  },
  {
    id: "surrealism",
    layer: "art",
    name: "Surrealism",
    nameEs: "Surrealismo",
    era: "1920s–40s · Europe",
    summary: "Dream logic; one impossible juxtaposition.",
    prompt:
      "surrealist imagery in the manner of a 1930s oil painting: one deliberate dream-logic juxtaposition, impossible scale made visually coherent",
    keywords: "surrealist 1930s oil painting, impossible scale, dream logic",
    traits: [],
  },
  {
    id: "pop-art",
    layer: "art",
    name: "Pop Art",
    nameEs: "Pop art",
    era: "1960s · US / UK",
    summary: "Ben-Day dots, flat saturated color, black outlines.",
    prompt:
      "pop art imagery: Ben-Day dots, flat saturated color fields, bold black contour lines",
    keywords: "pop art, Ben-Day dots, bold black outlines",
    traits: [],
  },
  {
    id: "op-art",
    layer: "art",
    name: "Op Art",
    nameEs: "Op art",
    era: "1960s · Europe",
    summary: "Optical illusion in stripes and checkers.",
    prompt:
      "op art imagery: black and white optical illusion of warping stripes and checkerboard volume",
    keywords: "op art, optical illusion stripes, checkerboard warp",
    traits: [],
  },
  {
    id: "cubism",
    layer: "art",
    name: "Cubism",
    nameEs: "Cubismo",
    era: "1907–1920s · France",
    summary: "Fragmented planes, several viewpoints at once.",
    prompt:
      "cubist imagery: the subject fragmented into flat overlapping planes seen from several viewpoints at once",
    keywords: "cubist, fragmented planes, multiple viewpoints",
    traits: [],
  },
  {
    id: "ukiyo-e",
    layer: "art",
    name: "Ukiyo-e",
    nameEs: "Ukiyo-e",
    era: "17th–19th c. · Japan",
    summary: "Woodblock contours, flat color, waves and mountains.",
    prompt:
      "ukiyo-e imagery: woodblock print contours, flat color areas, stylized waves and landscape forms",
    keywords: "ukiyo-e woodblock, flat color, Hokusai-like waves",
    traits: [],
  },
  {
    id: "dada-collage",
    layer: "art",
    name: "Dada Collage",
    nameEs: "Collage dadá",
    era: "1916–1920s · Europe",
    summary: "Torn newsprint, photo fragments, ransom-note type.",
    prompt:
      "Dada collage imagery: torn photographic fragments, cut newsprint, chance arrangements, ransom-note lettering",
    keywords: "Dada collage, cut-up photographs, ransom-note letters",
    traits: ["ownTexture", "ownLettering"],
  },
  {
    id: "suprematism",
    layer: "art",
    name: "Suprematism",
    nameEs: "Suprematismo",
    era: "1915–1920s · Russia",
    summary: "Pure geometric forms floating on white.",
    prompt:
      "suprematist imagery: pure rectangles, bars and circles floating on a white field at dynamic angles",
    keywords: "Suprematism, floating geometric forms, Malevich",
    traits: [],
  },
  {
    id: "psychedelia",
    layer: "art",
    name: "60s Psychedelia",
    nameEs: "Psicodelia de los 60",
    era: "1960s · San Francisco",
    summary: "Melting letterforms, vibrating complementaries.",
    prompt:
      "1960s psychedelic poster imagery: melting, flowing letterforms and vibrating complementary colors",
    keywords: "1960s psychedelic concert poster, melting lettering",
    traits: ["ownLettering"],
  },
  {
    id: "cut-paper",
    layer: "art",
    name: "Matisse Cut Paper",
    nameEs: "Papel recortado tipo Matisse",
    era: "1940s–50s · France",
    summary: "Organic cut shapes, no outlines.",
    prompt:
      "cut-paper imagery in the spirit of Matisse: organic shapes cut from colored paper, no outlines",
    keywords: "Matisse cut-outs, organic paper shapes",
    traits: [],
  },

  // ── Techniques ──────────────────────────────────────────────────────
  {
    id: "clean",
    layer: "technique",
    name: "Clean digital",
    nameEs: "Digital limpio",
    era: "Vector · screen",
    summary: "Flat vector, crisp edges, no simulated print.",
    prompt: "clean flat vector finish with crisp edges",
    keywords: "flat vector, crisp edges",
    traits: [],
  },
  {
    id: "risograph",
    layer: "technique",
    name: "Risograph",
    nameEs: "Risografía",
    era: "Stencil duplicator",
    summary: "Two or three spot inks, visible grain, slight misregistration.",
    prompt:
      "risograph print finish: two or three flat spot inks, visible ink grain, slightly misregistered layers, uncoated paper",
    keywords: "risograph print, spot inks, misregistration, grain",
    traits: ["ownTexture", "misregistered"],
  },
  {
    id: "screenprint",
    layer: "technique",
    name: "Screen print",
    nameEs: "Serigrafía",
    era: "Gig-poster tradition",
    summary: "Flat overlapping inks with registration drift.",
    prompt:
      "screen-print finish: flat opaque overlapping inks, slight registration drift, matte poster paper",
    keywords: "screen print, flat overlapping inks, gig poster",
    traits: ["ownTexture", "misregistered"],
  },
  {
    id: "letterpress",
    layer: "technique",
    name: "Letterpress",
    nameEs: "Letterpress",
    era: "Relief press",
    summary: "Ink pressed into thick paper; small honest flaws.",
    prompt:
      "letterpress finish: ink pressed into thick cotton paper, slight impression and small honest imperfections",
    keywords: "letterpress print, thick cotton paper, impression",
    traits: ["ownTexture"],
  },
  {
    id: "cyanotype",
    layer: "technique",
    name: "Cyanotype",
    nameEs: "Cianotipia",
    era: "1842 · photographic",
    summary: "Prussian blue and white, photogram look.",
    prompt:
      "cyanotype finish: Prussian blue ground with white photogram-like image, soft sun-print edges",
    keywords: "cyanotype, Prussian blue and white, sun print",
    traits: ["ownTexture", "fixedPalette"],
  },
  {
    id: "etching",
    layer: "technique",
    name: "Etching",
    nameEs: "Grabado al aguafuerte",
    era: "Intaglio",
    summary: "Fine lines and cross-hatching like an old banknote.",
    prompt:
      "etching finish: fine engraved lines and cross-hatching, intaglio plate tone",
    keywords: "etching, cross-hatching, engraved lines",
    traits: ["ownTexture"],
  },
  {
    id: "halftone",
    layer: "technique",
    name: "Halftone newsprint",
    nameEs: "Semitono de periódico",
    era: "Offset · newsprint",
    summary: "Visible dot screen on cheap paper.",
    prompt:
      "halftone finish: visible dot screen printed on off-white newsprint",
    keywords: "halftone dots, newsprint",
    traits: ["ownTexture"],
  },
  {
    id: "linocut",
    layer: "technique",
    name: "Linocut",
    nameEs: "Linograbado",
    era: "Relief block",
    summary: "Carved gouge marks, solid blacks.",
    prompt:
      "linocut finish: carved gouge marks, solid inked areas, slightly uneven relief impression",
    keywords: "linocut print, carved gouge marks",
    traits: ["ownTexture"],
  },
  {
    id: "mono-accent",
    layer: "technique",
    name: "Mono + one accent",
    nameEs: "Monocromo con un acento",
    era: "Offset · two-color",
    summary: "Black and white with a single accent color.",
    prompt:
      "two-color offset finish: everything in black and white except a single accent color",
    keywords: "monochrome with single accent color",
    traits: ["fixedPalette"],
  },
] as const satisfies readonly StyleDef[];

const STYLE_GROUP_BY_ID: Partial<
  Record<(typeof STYLE_DEFINITIONS)[number]["id"], string>
> = {
  swiss: "Grid and hierarchy",
  bauhaus: "Geometry and systems",
  constructivism: "Energy and urgency",
  "de-stijl": "Geometry and systems",
  "art-deco": "Ornamental geometry",
  "art-nouveau": "Ornamental geometry",
  memphis: "Playful expression",
  "japanese-minimal": "Space and focus",
  editorial: "Editorial typography",
  "polish-poster": "Metaphor and story",
  none: "No added illustration",
  surrealism: "Metaphor and story",
  "pop-art": "Playful expression",
  "op-art": "Geometry and systems",
  cubism: "Geometry and systems",
  "ukiyo-e": "Print and illustration",
  "dada-collage": "Metaphor and story",
  suprematism: "Geometry and systems",
  psychedelia: "Playful expression",
  "cut-paper": "Print and illustration",
  clean: "Clean and digital",
  risograph: "Ink and print",
  screenprint: "Ink and print",
  letterpress: "Ink and print",
  cyanotype: "Photo processes",
  etching: "Ink and print",
  halftone: "Ink and print",
  linocut: "Ink and print",
  "mono-accent": "Clean and digital",
};

const CURATED_STYLE_IDS = new Set([
  "swiss",
  "bauhaus",
  "constructivism",
  "japanese-minimal",
  "editorial",
  "surrealism",
  "cut-paper",
  "pop-art",
  "risograph",
  "screenprint",
  "letterpress",
  "clean",
]);

const defaultGroupByLayer: Record<StyleLayer, string> = {
  design: "Graphic movements",
  art: "Art movements",
  technique: "Print techniques",
};

export const STYLES = STYLE_DEFINITIONS.map((style) => ({
  ...style,
  searchTerms: [
    style.id.replaceAll("-", " "),
    style.name,
    style.era,
    style.summary,
  ],
  group: STYLE_GROUP_BY_ID[style.id] ?? defaultGroupByLayer[style.layer],
  curated: CURATED_STYLE_IDS.has(style.id),
})) satisfies readonly BrowsableStyle[];

export type Style = (typeof STYLES)[number];
export type StyleId = Style["id"];
export type DesignId = Extract<Style, { layer: "design" }>["id"];
export type ArtId = Extract<Style, { layer: "art" }>["id"];
export type TechniqueId = Extract<Style, { layer: "technique" }>["id"];

const byId = new Map<string, StyleDef>(STYLES.map((s) => [s.id, s]));

export function getStyle(id: StyleId): StyleDef {
  const s = byId.get(id);
  if (!s) throw new Error(`Unknown style: ${id}`);
  return s;
}

export function stylesOf(layer: StyleLayer): readonly BrowsableStyle[] {
  return STYLES.filter((s) => s.layer === layer);
}

export const hasTrait = (s: StyleDef, t: StyleTrait): boolean =>
  s.traits.includes(t);

/** Tuple form for z.enum(). */
export const DESIGN_IDS = STYLES.filter((s) => s.layer === "design").map(
  (s) => s.id,
) as [DesignId, ...DesignId[]];
export const ART_IDS = STYLES.filter((s) => s.layer === "art").map(
  (s) => s.id,
) as [ArtId, ...ArtId[]];
export const TECHNIQUE_IDS = STYLES.filter((s) => s.layer === "technique").map(
  (s) => s.id,
) as [TechniqueId, ...TechniqueId[]];
