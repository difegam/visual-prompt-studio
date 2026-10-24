import type { StyleTrait } from "./styles";

/**
 * Exclusions. Each one is expressed four ways because targets disagree on negatives:
 *  - instruction:  natural-language "avoid" clause (GPT Image, generic)
 *  - es:           Spanish clause for the seven-line pattern
 *  - tokens:       short concrete nouns for Midjourney --no / SDXL negative prompt
 *                  (Midjourney moderation reads --no words individually, so keep them concrete)
 *  - positive:     what to ask for instead (FLUX.2 has no negative prompts; BFL recommends
 *                  describing the desired result)
 */
export type AvoidGroup = "ai-look" | "text" | "finish";

export interface AvoidDef {
  readonly id: string;
  readonly label: string;
  readonly group: AvoidGroup;
  readonly instruction: string;
  readonly es: string;
  readonly tokens: readonly string[];
  readonly positive: string;
  /** Skip this exclusion when a selected style has this trait. */
  readonly skipWhen?: StyleTrait;
  readonly default: boolean;
}

export const AVOIDS = [
  // The beailabs "anti AI-face" fixed set: embellishments ChatGPT adds to almost everything.
  {
    id: "distressed",
    label: "Distressed texture",
    group: "ai-look",
    instruction: "distressed or grunge texture on letters and shapes",
    es: "textura desgastada",
    tokens: ["grunge", "distressed texture"],
    positive: "clean, solid letterforms and shapes",
    skipWhen: "ownTexture",
    default: true,
  },
  {
    id: "dry-brush",
    label: "Dry brush strokes",
    group: "ai-look",
    instruction: "dry brush strokes behind or under the text",
    es: "pinceladas secas",
    tokens: ["brush strokes"],
    positive: "flat, hard-edged color areas behind the text",
    default: true,
  },
  {
    id: "speed-lines",
    label: "Speed lines",
    group: "ai-look",
    instruction: "comic-style speed lines",
    es: "líneas de velocidad",
    tokens: ["speed lines"],
    positive: "motion expressed only through composition and angle",
    default: true,
  },
  {
    id: "rays",
    label: "Decorative rays",
    group: "ai-look",
    instruction: "small decorative rays radiating from words or objects",
    es: "rayos decorando elementos",
    tokens: ["sparkle rays"],
    positive: "objects stand alone without radiating accents",
    default: true,
  },
  {
    id: "brush-underline",
    label: "Brush underlines",
    group: "ai-look",
    instruction: "brush-stroke underlines below the headline",
    es: "subrayados de pincel",
    tokens: ["brush underline"],
    positive: "the headline stands on clean space with no underline",
    default: true,
  },
  {
    id: "glow",
    label: "Unmotivated glow",
    group: "ai-look",
    instruction: "glowing edges, lens flares or bloom without a light source",
    es: "brillos y destellos sin fuente de luz",
    tokens: ["glow", "lens flare", "bloom"],
    positive: "even, matte lighting with no glow",
    default: false,
  },
  {
    id: "particles",
    label: "Floating particles",
    group: "ai-look",
    instruction: "floating particles, sparkles or dust motes",
    es: "partículas flotantes",
    tokens: ["particles", "sparkles"],
    positive: "a calm, uncluttered background",
    default: false,
  },
  {
    id: "gloss-3d",
    label: "Glossy 3D plastic",
    group: "ai-look",
    instruction: "glossy 3D rendering or plastic sheen",
    es: "render 3D brillante o aspecto plástico",
    tokens: ["3d render", "gloss", "plastic"],
    positive: "flat printed surfaces with no 3D shading",
    default: true,
  },
  {
    id: "gradients",
    label: "Default gradients",
    group: "ai-look",
    instruction: "decorative color gradients or sunset washes",
    es: "degradados decorativos",
    tokens: ["gradient"],
    positive: "solid flat color fields",
    default: false,
  },
  {
    id: "cinematic",
    label: "Cinematic lighting",
    group: "ai-look",
    instruction: "dramatic cinematic lighting",
    es: "iluminación cinematográfica dramática",
    tokens: ["cinematic lighting", "volumetric light"],
    positive: "flat graphic light without dramatic shadows",
    default: false,
  },
  {
    id: "stock",
    label: "Stock-photo clichés",
    group: "ai-look",
    instruction: "generic stock-photo motifs and smiling models",
    es: "tópicos de foto de stock",
    tokens: ["stock photo", "smiling models"],
    positive: "one specific, unexpected image idea",
    default: false,
  },
  {
    id: "overcrowded",
    label: "Overcrowded detail",
    group: "ai-look",
    instruction: "overcrowded ornament and filler details",
    es: "exceso de detalles de relleno",
    tokens: ["clutter", "ornament"],
    positive: "only elements that serve the message",
    default: false,
  },
  {
    id: "symmetry",
    label: "Automatic symmetry",
    group: "ai-look",
    instruction: "centered, mirror-symmetric composition by default",
    es: "composición centrada y simétrica por defecto",
    tokens: ["symmetrical composition"],
    positive: "an intentional asymmetric composition",
    default: false,
  },
  {
    id: "icons",
    label: "Calendar & pin icons",
    group: "ai-look",
    instruction: "calendar, clock or location-pin icons",
    es: "iconos de calendario, reloj o ubicación",
    tokens: ["calendar icon", "clock icon", "map pin"],
    positive: "dates and places set as plain type",
    default: false,
  },
  // Text
  {
    id: "invented-text",
    label: "Invented text",
    group: "text",
    instruction: "any words, taglines or slogans not listed in the exact text",
    es: "frases que no estén en el texto exacto",
    tokens: ["extra text", "tagline"],
    positive: "only the exact text listed, nothing else written",
    default: true,
  },
  {
    id: "watermarks",
    label: "Watermarks & fake logos",
    group: "text",
    instruction: "watermarks, signatures or invented logos",
    es: "marcas de agua, firmas o logotipos inventados",
    tokens: ["watermark", "signature", "logo"],
    positive: "no marks besides the requested text",
    default: true,
  },
  // Finish
  {
    id: "grain",
    label: "All grain",
    group: "finish",
    instruction: "film grain or noise",
    es: "grano o ruido",
    tokens: ["grain", "noise"],
    positive: "smooth, noise-free color",
    skipWhen: "ownTexture",
    default: false,
  },
  {
    id: "paper",
    label: "Paper texture",
    group: "finish",
    instruction: "paper or canvas texture",
    es: "textura de papel",
    tokens: ["paper texture"],
    positive: "a perfectly smooth surface",
    skipWhen: "ownTexture",
    default: false,
  },
  {
    id: "misregistration",
    label: "Misregistration",
    group: "finish",
    instruction: "misregistered or offset color layers",
    es: "capas de color desalineadas",
    tokens: ["misregistration"],
    positive: "perfectly registered colors",
    skipWhen: "misregistered",
    default: false,
  },
] as const satisfies readonly AvoidDef[];

export type AvoidId = (typeof AVOIDS)[number]["id"];
export const AVOID_IDS = AVOIDS.map((a) => a.id) as [AvoidId, ...AvoidId[]];
export const DEFAULT_AVOIDS: AvoidId[] = AVOIDS.filter((a) => a.default).map(
  (a) => a.id,
);

const avoidById = new Map<string, AvoidDef>(AVOIDS.map((a) => [a.id, a]));
export const getAvoid = (id: AvoidId): AvoidDef =>
  avoidById.get(id) as AvoidDef;

/**
 * Subject clichés: what a model reaches for when a brief has no direction.
 * Find yours by generating the generic version first and naming what repeats.
 * Sets adapted from the beailabs guide, section 4.
 */
export interface ClicheDef {
  readonly id: string;
  readonly label: string;
  readonly items: readonly string[];
  readonly es: readonly string[];
  readonly tokens: readonly string[];
}

export const CLICHES = [
  { id: "none", label: "None", items: [], es: [], tokens: [] },
  {
    id: "exhibition",
    label: "Art exhibition",
    items: ["classical marble busts", "gold leaf", "paint splashes"],
    es: ["bustos y estatuas clásicas", "pan de oro", "brochazos de color"],
    tokens: ["marble bust", "gold leaf", "paint splash"],
  },
  {
    id: "book-fair",
    label: "Book event",
    items: ["stacked books", "reading glasses", "coffee cups", "autumn leaves"],
    es: ["libros apilados", "gafas", "tazas de café", "hojas secas"],
    tokens: ["stacked books", "glasses", "coffee cup", "autumn leaves"],
  },
  {
    id: "festival",
    label: "Street festival",
    items: ["bunting", "paper lanterns", "fireworks", "sunset gradient"],
    es: [
      "banderines",
      "farolillos",
      "fuegos artificiales",
      "degradado de atardecer",
    ],
    tokens: ["bunting", "lanterns", "fireworks"],
  },
  {
    id: "race",
    label: "Running race",
    items: [
      "running silhouettes",
      "finish-line tape",
      "slanted sporty lettering",
    ],
    es: ["siluetas corriendo", "línea de meta", "letra deportiva inclinada"],
    tokens: ["running silhouettes", "finish line"],
  },
  {
    id: "summer",
    label: "Summer / pool",
    items: ["smiling sun", "water splashes", "palm leaves"],
    es: ["sol sonriente", "salpicaduras", "hojas de palmera"],
    tokens: ["smiling sun", "splash", "palm leaves"],
  },
  {
    id: "concert",
    label: "Concert",
    items: [
      "yellow spotlight",
      "microphone",
      "black background",
      "music notes",
    ],
    es: ["foco amarillo", "micrófono", "fondo negro", "notas musicales"],
    tokens: ["spotlight", "microphone", "music notes"],
  },
  {
    id: "coffee",
    label: "Café / food",
    items: ["steam swirls", "coffee beans", "wooden tabletop"],
    es: ["volutas de vapor", "granos de café", "mesa de madera"],
    tokens: ["steam swirls", "coffee beans", "wood table"],
  },
] as const satisfies readonly ClicheDef[];

export type ClicheId = (typeof CLICHES)[number]["id"];
export const CLICHE_IDS = CLICHES.map((c) => c.id) as [ClicheId, ...ClicheId[]];
export const getCliche = (id: ClicheId): ClicheDef =>
  CLICHES.find((c) => c.id === id) ?? CLICHES[0];
