import { z } from "zod";
import { ART_IDS, DESIGN_IDS, TECHNIQUE_IDS } from "./styles";
import { AVOID_IDS, CLICHE_IDS, DEFAULT_AVOIDS } from "./avoids";
import { FONT_IDS } from "./fonts";

/* ── Option catalogs ─────────────────────────────────────────────────── */

export const PURPOSES = [
  {
    id: "poster",
    label: "Poster",
    noun: "poster",
    es: "cartel",
    aspect: "4:5",
  },
  { id: "flyer", label: "Flyer", noun: "flyer", es: "flyer", aspect: "2:3" },
  {
    id: "book-cover",
    label: "Book cover",
    noun: "book cover",
    es: "portada de libro",
    aspect: "2:3",
  },
  {
    id: "album-cover",
    label: "Album cover",
    noun: "album cover",
    es: "portada de disco",
    aspect: "1:1",
  },
  {
    id: "social",
    label: "Social post",
    noun: "social media post",
    es: "publicación para redes",
    aspect: "4:5",
  },
  {
    id: "story",
    label: "Story / Reel cover",
    noun: "vertical story cover",
    es: "portada de story",
    aspect: "9:16",
  },
  {
    id: "editorial",
    label: "Editorial illustration",
    noun: "editorial illustration",
    es: "ilustración editorial",
    aspect: "3:2",
  },
  {
    id: "banner",
    label: "Event banner",
    noun: "wide event banner",
    es: "banner de evento",
    aspect: "16:9",
  },
] as const;
export type PurposeId = (typeof PURPOSES)[number]["id"];
const PURPOSE_IDS = PURPOSES.map((p) => p.id) as [PurposeId, ...PurposeId[]];

export const ASPECTS = [
  "16:9",
  "9:16",
  "1:1",
  "4:3",
  "3:2",
  "21:9",
  "4:5",
  "3:4",
  "2:3",
] as const;
export type Aspect = (typeof ASPECTS)[number];

export const ASPECT_LABELS: Record<Aspect, string> = {
  "16:9": "HD video",
  "9:16": "Vertical",
  "1:1": "Square",
  "4:3": "Classic",
  "3:2": "DSLR",
  "21:9": "Ultrawide",
  "4:5": "Social",
  "3:4": "Portrait",
  "2:3": "Book",
};

export function aspectRatio(a: Aspect): { w: number; h: number } {
  const [w, h] = a.split(":").map(Number) as [number, number];
  return { w, h };
}

export function orientation(a: Aspect): "portrait" | "landscape" | "square" {
  const { w, h } = aspectRatio(a);
  return w === h ? "square" : w > h ? "landscape" : "portrait";
}

export const TARGETS = [
  {
    id: "gpt-image",
    label: "ChatGPT Images",
    model: "GPT Image 2",
    note: "Natural language. Strong text rendering; quote every word that must appear.",
  },
  {
    id: "midjourney",
    label: "Midjourney",
    model: "V8.x",
    note: "Descriptive phrase plus parameters at the end: --ar, --no, --sref, --raw.",
  },
  {
    id: "flux",
    label: "FLUX",
    model: "FLUX.2",
    note: "No negative prompts. Exclusions are rewritten as what you want instead.",
  },
  {
    id: "sdxl",
    label: "Stable Diffusion",
    model: "SDXL / ComfyUI",
    note: "Separate positive and negative prompts. Weak at text: prefer leaving space.",
  },
  {
    id: "generic",
    label: "Other model",
    model: "Any text-to-image",
    note: "Plain natural language with constraints stated in words.",
  },
] as const;
export type TargetId = (typeof TARGETS)[number]["id"];
const TARGET_IDS = TARGETS.map((t) => t.id) as [TargetId, ...TargetId[]];

export const PATTERNS = [
  {
    id: "concise",
    label: "Art direction",
    hint: "One dense paragraph. Works everywhere.",
  },
  {
    id: "seven-line",
    label: "Seven-line brief",
    hint: "Same seven lines every time. Swap only the Style line to compare.",
  },
  {
    id: "spec",
    label: "Production spec",
    hint: "Sectioned brief for complex layouts and handoff.",
  },
  {
    id: "restyle",
    label: "Restyle in same chat",
    hint: "Forces a clean restart so the last image does not leak in.",
  },
  {
    id: "edit",
    label: "Edit with reference",
    hint: "Change one thing in an attached image; protect the rest.",
  },
] as const;
export type PatternId = (typeof PATTERNS)[number]["id"];
const PATTERN_IDS = PATTERNS.map((p) => p.id) as [PatternId, ...PatternId[]];

/** Midjourney and SDXL want keyword prompts; long structured briefs don't fit them. */
export const PATTERNS_BY_TARGET: Record<TargetId, readonly PatternId[]> = {
  "gpt-image": ["concise", "seven-line", "spec", "restyle", "edit"],
  flux: ["concise", "seven-line", "spec", "edit"],
  generic: ["concise", "seven-line", "spec", "restyle", "edit"],
  midjourney: ["concise"],
  sdxl: ["concise"],
};

export const SIGNATURES = [
  {
    id: "concept",
    label: "Concept first",
    hint: "A metaphor tied directly to the subject.",
    prompt: "Lead with one clear visual metaphor tied directly to the subject.",
    es: "Una única metáfora visual ligada directamente al tema.",
  },
  {
    id: "material",
    label: "Material honesty",
    hint: "Realistic behavior of ink, paper and light.",
    prompt: "Make inks, paper and light behave realistically.",
    es: "Tintas, papel y luz con comportamiento realista.",
  },
  {
    id: "variation",
    label: "Purposeful variation",
    hint: "Handmade character without random noise.",
    prompt: "Allow small handmade irregularities, never random noise.",
    es: "Pequeñas irregularidades hechas a mano, nunca ruido aleatorio.",
  },
  {
    id: "restraint",
    label: "Confident restraint",
    hint: "Keep only what earns its place.",
    prompt:
      "Keep only elements that earn their place; leave real breathing room.",
    es: "Solo los elementos que se ganan su sitio, con aire de verdad.",
  },
] as const;
export type SignatureId = (typeof SIGNATURES)[number]["id"];
const SIGNATURE_IDS = SIGNATURES.map((s) => s.id) as [
  SignatureId,
  ...SignatureId[],
];

/* ── Recipe schema (the single source of truth for state, import and export) ── */

const hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color like #1F4FA3");

export const PaletteColorSchema = z.object({
  hex,
  name: z.string().trim().min(1).max(40),
});

/** Midjourney style reference: a numeric/alphanumeric code or an https image URL. */
const srefToken = z
  .string()
  .trim()
  .refine((v) => /^[a-z0-9]{1,24}$/i.test(v) || /^https:\/\/\S+$/.test(v), {
    message:
      "A style reference is a code (letters and digits) or an https image URL",
  });

export const RecipeSchema = z.object({
  version: z.literal(2),
  idea: z
    .string()
    .trim()
    .min(3, "Describe what you are making in a few words")
    .max(400),
  purpose: z.enum(PURPOSE_IDS),
  aspect: z.enum(ASPECTS),
  headline: z.string().max(80),
  extraText: z.array(z.string().trim().min(1).max(80)).max(4),
  textMode: z.enum(["render", "space"]),
  detail: z.string().max(240),
  styles: z.object({
    design: z.enum(DESIGN_IDS),
    art: z.enum(ART_IDS),
    technique: z.enum(TECHNIQUE_IDS),
  }),
  palette: z.tuple([
    PaletteColorSchema,
    PaletteColorSchema,
    PaletteColorSchema,
  ]),
  font: z.union([z.literal("style"), z.enum(FONT_IDS)]),
  signatures: z.array(z.enum(SIGNATURE_IDS)).max(4),
  avoids: z.array(z.enum(AVOID_IDS)),
  cliche: z.enum(CLICHE_IDS),
  target: z.enum(TARGET_IDS),
  pattern: z.enum(PATTERN_IDS),
  language: z.enum(["en", "es"]),
  edit: z.object({
    change: z.string().max(240),
    preserve: z.string().max(240),
  }),
  midjourney: z.object({
    sref: z.array(srefToken).max(5),
    raw: z.boolean(),
    stylize: z.number().int().min(0).max(1000).nullable(),
  }),
});

export type Recipe = z.infer<typeof RecipeSchema>;
export type PaletteColorValue = z.infer<typeof PaletteColorSchema>;

export const DEFAULT_RECIPE: Recipe = {
  version: 2,
  idea: "A conceptual exhibition poster for a contemporary ceramics opening",
  purpose: "poster",
  aspect: "4:5",
  headline: "OBJECTS IN MOTION",
  extraText: ["14 NOV · 18:00", "GALERIE VRIJTHOF"],
  textMode: "render",
  detail:
    "one oversized porcelain handle becomes an archway people walk through",
  styles: { design: "swiss", art: "surrealism", technique: "risograph" },
  palette: [
    { hex: "#F1F1EC", name: "off-white" },
    { hex: "#E2261C", name: "signal red" },
    { hex: "#16181B", name: "black" },
  ],
  font: "style",
  signatures: ["concept"],
  avoids: [...DEFAULT_AVOIDS],
  cliche: "exhibition",
  target: "gpt-image",
  pattern: "concise",
  language: "en",
  edit: { change: "", preserve: "" },
  midjourney: { sref: [], raw: true, stylize: null },
};

export type ParseResult =
  { ok: true; recipe: Recipe } | { ok: false; issues: string[] };

/** Validate untrusted input (pasted JSON, files, storage). Never throws. */
export function parseRecipe(input: unknown): ParseResult {
  const res = RecipeSchema.safeParse(input);
  if (res.success) return { ok: true, recipe: res.data };
  return {
    ok: false,
    issues: res.error.issues.map(
      (i) => `${i.path.join(".") || "recipe"}: ${i.message}`,
    ),
  };
}

export function parseRecipeJson(text: string): ParseResult {
  try {
    return parseRecipe(JSON.parse(text));
  } catch {
    return {
      ok: false,
      issues: [
        "This is not valid JSON. Paste the full recipe including the outer { }.",
      ],
    };
  }
}
