/**
 * Pure, deterministic prompt compiler: Recipe → CompiledPrompt.
 * Every piece of output is a Segment tagged with the input it came from, so the UI can
 * show which layer produced which words. No DOM, no randomness, no I/O.
 */
import { getAvoid, getCliche, type AvoidId } from "./avoids";
import { getFont } from "./fonts";
import {
  PATTERNS_BY_TARGET,
  PURPOSES,
  SIGNATURES,
  orientation,
  type Aspect,
  type PatternId,
  type Recipe,
} from "./recipe";
import { getStyle, hasTrait, type StyleDef } from "./styles";

export type SourceKind =
  | "frame"
  | "subject"
  | "design"
  | "art"
  | "technique"
  | "type"
  | "palette"
  | "text"
  | "signature"
  | "avoid"
  | "param";

export interface Segment {
  readonly text: string;
  readonly source: SourceKind;
}

export interface Notice {
  readonly level: "info" | "warn";
  readonly message: string;
}

export interface SkippedAvoid {
  readonly id: AvoidId;
  readonly label: string;
  readonly reason: string;
}

export interface CompiledPrompt {
  readonly pattern: PatternId;
  readonly segments: readonly Segment[];
  readonly text: string;
  /** SDXL only: separate negative prompt. */
  readonly negative: readonly Segment[] | null;
  readonly negativeText: string | null;
  readonly notices: readonly Notice[];
  readonly skipped: readonly SkippedAvoid[];
  /** The same brief with no direction: what most people type. */
  readonly baseline: string;
}

/* ── helpers ─────────────────────────────────────────────────────────── */

class Out {
  readonly segs: Segment[] = [];
  add(source: SourceKind, text: string): this {
    if (text) this.segs.push({ source, text });
    return this;
  }
  get text(): string {
    return this.segs.map((s) => s.text).join("");
  }
}

type Lang = "en" | "es";

export function joinList(items: readonly string[], lang: Lang = "en"): string {
  const and = lang === "es" ? " y " : " and ";
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")}${and}${items.at(-1)}`;
}

const trimEnd = (s: string): string => s.trim().replace(/[.;,\s]+$/, "");
const quote = (s: string): string => `"${s.replaceAll('"', "'")}"`;
const uniq = <T>(xs: readonly T[]): T[] => [...new Set(xs)];

/* ── resolved context: every decision made once, before formatting ─────── */

interface Context {
  readonly r: Recipe;
  readonly lang: Lang;
  readonly design: StyleDef;
  readonly art: StyleDef | null;
  readonly technique: StyleDef;
  readonly purpose: (typeof PURPOSES)[number];
  readonly texts: readonly string[];
  readonly palette: Recipe["palette"];
  readonly typeEn: string;
  readonly typeEs: string;
  readonly avoids: readonly AvoidId[];
  readonly skipped: readonly SkippedAvoid[];
  readonly cliche: ReturnType<typeof getCliche>;
  readonly notices: Notice[];
}

/** The palette actually sent, after techniques that dictate color. Shared with the preview. */
export function effectivePalette(r: Recipe): Recipe["palette"] {
  if (r.styles.technique === "cyanotype") {
    return [
      { hex: "#1D4E89", name: "Prussian blue" },
      { hex: "#F2F4F1", name: "white" },
      { hex: "#8FB3D6", name: "pale blue" },
    ];
  }
  if (r.styles.technique === "mono-accent") {
    return [
      { hex: "#F2F1EE", name: "white" },
      r.palette[1],
      { hex: "#151515", name: "black" },
    ];
  }
  return r.palette;
}

function resolve(r: Recipe): Context {
  const notices: Notice[] = [];
  const design = getStyle(r.styles.design);
  const artDef = getStyle(r.styles.art);
  const art = r.styles.art === "none" ? null : artDef;
  const technique = getStyle(r.styles.technique);
  const purpose = PURPOSES.find((p) => p.id === r.purpose) ?? PURPOSES[0];
  const layers = [design, art, technique].filter(
    (s): s is StyleDef => s !== null,
  );

  // Palette: some techniques dictate it.
  const palette = effectivePalette(r);
  if (technique.id === "cyanotype") {
    notices.push({
      level: "info",
      message: "Cyanotype sets the palette to Prussian blue and white.",
    });
  } else if (technique.id === "mono-accent") {
    notices.push({
      level: "info",
      message: `Mono + one accent keeps only ${r.palette[1].name} as color.`,
    });
  }

  // Typography: a style with its own lettering wins over a chosen font.
  const lettering = layers.find((s) => hasTrait(s, "ownLettering"));
  const font = r.font === "style" ? undefined : getFont(r.font);
  let typeEn: string;
  let typeEs: string;
  if (lettering) {
    typeEn = `the style's own lettering (${lettering.name})`;
    typeEs = "la propia del estilo";
    if (font) {
      notices.push({
        level: "info",
        message: `${lettering.name} brings its own lettering, so the ${font.family} choice is not sent.`,
      });
    }
  } else if (font) {
    typeEn = font.prompt;
    typeEs = font.promptEs;
  } else {
    typeEn = design.typeHint ?? "the style's own typography";
    typeEs = "la propia del estilo";
  }

  // Exclusions: drop the ones a chosen style depends on.
  const skipped: SkippedAvoid[] = [];
  const avoids: AvoidId[] = [];
  for (const id of r.avoids) {
    const a = getAvoid(id);
    const owner = a.skipWhen
      ? layers.find((s) => hasTrait(s, a.skipWhen!))
      : undefined;
    if (owner) {
      skipped.push({
        id,
        label: a.label,
        reason: `${owner.name} depends on it`,
      });
    } else {
      avoids.push(id);
    }
  }

  const texts =
    r.textMode === "render"
      ? [r.headline, ...r.extraText].map((t) => t.trim()).filter(Boolean)
      : [];
  if (r.textMode === "render" && texts.length === 0) {
    notices.push({
      level: "warn",
      message:
        "No text is listed, so the model may invent some. Add a headline or choose “Leave space”.",
    });
  }
  if (
    layers.length === 3 &&
    art &&
    hasTrait(art, "ownTexture") &&
    hasTrait(technique, "ownTexture")
  ) {
    notices.push({
      level: "info",
      message: `${art.name} and ${technique.name} both add texture. Expect a busy surface.`,
    });
  }

  return {
    r,
    lang: r.language,
    design,
    art,
    technique,
    purpose,
    texts,
    palette,
    typeEn,
    typeEs,
    avoids,
    skipped,
    cliche: getCliche(r.cliche),
    notices,
  };
}

/* ── shared fragments ────────────────────────────────────────────────── */

function formatEn(a: Aspect): string {
  return `${orientation(a)} ${a}`;
}
function formatEs(a: Aspect): string {
  const o = orientation(a);
  return `${o === "portrait" ? "vertical" : o === "landscape" ? "horizontal" : "cuadrado"} ${a}`;
}

function paletteEn(ctx: Context): string {
  return joinList(ctx.palette.map((c) => `${c.name} (${c.hex.toUpperCase()})`));
}
function paletteNames(ctx: Context, lang: Lang = "en"): string {
  return joinList(
    ctx.palette.map((c) => c.name),
    lang,
  );
}

function exactTextEn(ctx: Context): string {
  if (ctx.r.textMode === "space") {
    return "Render no text at all; leave clean, empty space for a headline that will be added later";
  }
  return `Render exactly this text: ${ctx.texts.map(quote).join(", ")}, and no other text`;
}

function avoidPhrasesEn(ctx: Context): string[] {
  return [
    ...ctx.cliche.items,
    ...ctx.avoids.map((id) => getAvoid(id).instruction),
  ];
}

function styleLineEn(ctx: Context): string {
  const parts = [`layout in ${ctx.design.name}`];
  if (ctx.art) parts.push(`imagery in ${ctx.art.name}`);
  parts.push(`${ctx.technique.name} technique`);
  return parts.join(", ");
}
function styleLineEs(ctx: Context): string {
  const parts = [`maquetación ${ctx.design.nameEs}`];
  if (ctx.art) parts.push(`ilustración estilo ${ctx.art.nameEs.toLowerCase()}`);
  parts.push(`técnica de ${ctx.technique.nameEs.toLowerCase()}`);
  return parts.join(", ");
}

function signatures(ctx: Context, lang: Lang): string[] {
  return ctx.r.signatures.map((id) => {
    const s = SIGNATURES.find((x) => x.id === id)!;
    return lang === "es" ? s.es : s.prompt;
  });
}

/* ── patterns for natural-language targets (GPT Image, FLUX, generic) ── */

function concise(ctx: Context, o: Out, flux: boolean): void {
  const { r } = ctx;
  o.add("frame", `Create a ${formatEn(r.aspect)} ${ctx.purpose.noun}: `);
  o.add("subject", `${lowerFirst(trimEnd(r.idea))}.`);
  if (r.detail.trim()) o.add("subject", ` Concept: ${trimEnd(r.detail)}.`);
  o.add("frame", " Art direction: ");
  o.add("design", ctx.design.prompt);
  if (ctx.art) o.add("frame", "; ").add("art", ctx.art.prompt);
  o.add("frame", "; ").add("technique", ctx.technique.prompt).add("frame", ".");
  o.add("type", ` Typography: ${ctx.typeEn}.`);
  o.add("palette", ` Palette: ${paletteEn(ctx)}, no other colors.`);
  o.add("text", ` ${exactTextEn(ctx)}.`);
  for (const s of signatures(ctx, "en")) o.add("signature", ` ${s}`);
  if (flux) {
    const pos = ctx.avoids.map((id) => getAvoid(id).positive);
    if (pos.length) o.add("avoid", ` Finish details: ${pos.join("; ")}.`);
  } else {
    const av = avoidPhrasesEn(ctx);
    if (av.length) o.add("avoid", ` Avoid: ${av.join("; ")}.`);
  }
}

function sevenLine(ctx: Context, o: Out, flux: boolean): void {
  const { r } = ctx;
  const es = ctx.lang === "es";
  const L = es
    ? {
        f: "Formato",
        q: "Qué es",
        t: "Tema",
        s: "Estilo",
        x: "Texto exacto",
        tp: "Tipografía y paleta",
        e: "Evita",
        i: "En su lugar",
      }
    : {
        f: "Format",
        q: "What it is",
        t: "Content",
        s: "Style",
        x: "Exact text",
        tp: "Typography and palette",
        e: "Avoid",
        i: "Instead",
      };

  o.add("frame", `${L.f}: `).add(
    "frame",
    es ? formatEs(r.aspect) : formatEn(r.aspect),
  );
  o.add("frame", `\n${L.q}: `).add("subject", trimEnd(r.idea));

  const content: string[] = [];
  if (r.textMode === "render" && r.extraText.length)
    content.push(r.extraText.join(", "));
  if (r.detail.trim())
    content.push(`${es ? "concepto" : "concept"}: ${trimEnd(r.detail)}`);
  content.push(...signatures(ctx, ctx.lang).map(trimEnd));
  o.add("frame", `\n${L.t}: `).add(
    "subject",
    content.join("; ") || trimEnd(r.idea),
  );

  o.add("frame", `\n${L.s}: `).add(
    "design",
    es ? styleLineEs(ctx) : styleLineEn(ctx),
  );

  o.add("frame", `\n${L.x}: `);
  if (r.textMode === "space") {
    o.add(
      "text",
      es
        ? "ninguno; deja espacio limpio para añadir el titular después"
        : "none; leave clean space for a headline added later",
    );
  } else {
    o.add(
      "text",
      `${ctx.texts.map(quote).join(", ")} ${es ? "y ningún otro texto" : "and no other text"}`,
    );
  }

  o.add("frame", `\n${L.tp}: `)
    .add("type", es ? ctx.typeEs : ctx.typeEn)
    .add("frame", ", ")
    .add(
      "palette",
      `${paletteNames(ctx, ctx.lang)} (${ctx.palette.map((c) => c.hex.toUpperCase()).join(", ")})`,
    );

  if (flux) {
    const pos = ctx.avoids.map((id) => getAvoid(id).positive);
    if (pos.length) o.add("frame", `\n${L.i}: `).add("avoid", pos.join("; "));
    return;
  }
  const cliche = es ? ctx.cliche.es : ctx.cliche.items;
  const fixed = ctx.avoids.map((id) =>
    es ? getAvoid(id).es : getAvoid(id).instruction,
  );
  if (cliche.length || fixed.length) {
    o.add("frame", `\n${L.e}: `);
    // The guide's shape: subject clichés first, then the fixed anti-AI-look part.
    const head = cliche.length ? `${joinList(cliche, ctx.lang)}. ` : "";
    const tail = fixed.length ? capitalize(fixed.join("; ")) : "";
    o.add("avoid", trimEnd(head + tail));
  }
}

const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);
/** Lowercase a leading article only ("A poster…" → "a poster…"); leave names and acronyms alone. */
const lowerFirst = (s: string): string =>
  s.replace(/^(A|An|The)\b/, (m) => m.toLowerCase());

function spec(ctx: Context, o: Out, flux: boolean): void {
  const { r } = ctx;
  o.add("frame", "PURPOSE: ")
    .add("frame", `A ${formatEn(r.aspect)} ${ctx.purpose.noun}. `)
    .add("subject", `${trimEnd(r.idea)}.`);
  const concept = [
    r.detail.trim() ? `${capitalize(trimEnd(r.detail))}.` : "",
    ...signatures(ctx, "en"),
  ].filter(Boolean);
  if (concept.length)
    o.add("frame", "\nCONCEPT: ").add("subject", concept.join(" "));
  o.add("frame", "\nLAYOUT: ").add(
    "design",
    `${capitalize(ctx.design.prompt)}.`,
  );
  o.add("frame", "\nIMAGERY: ").add(
    "art",
    ctx.art
      ? `${capitalize(ctx.art.prompt)}.`
      : `Imagery drawn in the visual language of ${ctx.design.name}.`,
  );
  o.add("frame", "\nFINISH: ").add(
    "technique",
    `${capitalize(ctx.technique.prompt)}.`,
  );
  o.add("frame", "\nTYPOGRAPHY: ").add("type", `${capitalize(ctx.typeEn)}.`);
  o.add("frame", "\nPALETTE: ").add(
    "palette",
    `${capitalize(paletteEn(ctx))}. Use no other colors.`,
  );
  o.add("frame", "\nCOPY: ");
  if (r.textMode === "space") {
    o.add(
      "text",
      "No text. Reserve clean space for a headline added in layout software.",
    );
  } else {
    const [head, ...rest] = ctx.texts;
    const lines = [
      head ? `${quote(head)} as the dominant headline` : "",
      ...rest.map(quote),
    ].filter(Boolean);
    o.add(
      "text",
      `Render exactly ${joinList(lines)}. No other text, letters or numbers.`,
    );
  }
  if (flux) {
    const pos = ctx.avoids.map((id) => getAvoid(id).positive);
    if (pos.length)
      o.add("frame", "\nDETAILS: ").add(
        "avoid",
        `${capitalize(pos.join("; "))}.`,
      );
  } else {
    const av = avoidPhrasesEn(ctx);
    if (av.length)
      o.add("frame", "\nAVOID: ").add("avoid", `${capitalize(av.join("; "))}.`);
  }
  o.add(
    "frame",
    `\nOUTPUT: One finished ${ctx.purpose.noun}, full bleed. No mockup, frame, wall or device.`,
  );
}

function restyle(ctx: Context, o: Out): void {
  const es = ctx.lang === "es";
  if (es) {
    o.add("frame", "Hazla en estilo ")
      .add("design", styleLineEs(ctx))
      .add("frame", ". ");
    o.add(
      "frame",
      "Empieza de cero: no conserves nada de la imagen anterior. Mantén solo el texto exacto y la línea de Evita.",
    );
  } else {
    o.add("frame", "Make it in this style: ")
      .add("design", styleLineEn(ctx))
      .add("frame", ". ");
    o.add(
      "frame",
      "Start from scratch: keep nothing from the previous image. Keep only the exact text and the avoid list.",
    );
  }
  o.add("frame", es ? "\nTexto exacto: " : "\nExact text: ");
  o.add(
    "text",
    ctx.r.textMode === "space"
      ? es
        ? "ninguno"
        : "none"
      : `${ctx.texts.map(quote).join(", ")} ${es ? "y ningún otro texto" : "and no other text"}`,
  );
  o.add("frame", es ? "\nTipografía y paleta: " : "\nTypography and palette: ")
    .add("type", es ? ctx.typeEs : ctx.typeEn)
    .add("frame", ", ")
    .add("palette", paletteNames(ctx, ctx.lang));
  const av = es
    ? [...ctx.cliche.es, ...ctx.avoids.map((id) => getAvoid(id).es)]
    : avoidPhrasesEn(ctx);
  if (av.length)
    o.add("frame", es ? "\nEvita: " : "\nAvoid: ").add("avoid", av.join("; "));
}

function edit(ctx: Context, o: Out, flux: boolean): void {
  const { r } = ctx;
  o.add("frame", "Edit the attached image.");
  o.add("frame", "\nChange only: ").add(
    "subject",
    r.edit.change.trim()
      ? trimEnd(r.edit.change)
      : `the visual style, to ${styleLineEn(ctx)}`,
  );
  o.add("frame", "\nKeep exactly as it is: ").add(
    "subject",
    r.edit.preserve.trim()
      ? trimEnd(r.edit.preserve)
      : "the composition, the subject placement and every piece of text",
  );
  o.add("frame", "\nApply: ").add("design", ctx.design.prompt);
  if (ctx.art) o.add("frame", "; ").add("art", ctx.art.prompt);
  o.add("frame", "; ").add("technique", ctx.technique.prompt);
  o.add("palette", `\nPalette: ${paletteEn(ctx)}.`);
  if (r.textMode === "render" && ctx.texts.length) {
    o.add(
      "text",
      `\nText must read exactly: ${ctx.texts.map(quote).join(", ")}. Do not add, remove or restyle any other text.`,
    );
  }
  if (flux) {
    const pos = ctx.avoids.map((id) => getAvoid(id).positive);
    if (pos.length) o.add("avoid", `\nDetails: ${pos.join("; ")}.`);
  } else {
    const av = avoidPhrasesEn(ctx);
    if (av.length) o.add("avoid", `\nDo not introduce: ${av.join("; ")}.`);
  }
  ctx.notices.push({
    level: "info",
    message:
      "Region edits can spill past the selection. The “Keep exactly” line repeats what must not change.",
  });
}

/* ── keyword targets ─────────────────────────────────────────────────── */

function negativeTokens(ctx: Context): string[] {
  const t = [
    ...ctx.cliche.tokens,
    ...ctx.avoids.flatMap((id) => getAvoid(id).tokens),
  ];
  if (ctx.r.textMode === "space") t.push("text", "letters", "typography");
  return uniq(t);
}

function midjourney(ctx: Context, o: Out): void {
  const { r } = ctx;
  o.add("subject", trimEnd(r.idea)).add("frame", `, ${ctx.purpose.noun}`);
  if (r.detail.trim()) o.add("subject", `, ${trimEnd(r.detail)}`);
  o.add("frame", ", ").add("design", ctx.design.keywords);
  if (ctx.art) o.add("frame", ", ").add("art", ctx.art.keywords);
  o.add("frame", ", ").add("technique", ctx.technique.keywords);
  o.add("type", `, ${ctx.typeEn}`);
  o.add("palette", `, limited palette of ${paletteNames(ctx)}`);
  const [head, ...rest] = ctx.texts;
  if (head) o.add("text", `, the text ${quote(head)}`);
  if (rest.length) {
    ctx.notices.push({
      level: "info",
      message:
        "Midjourney renders short text best, so only the headline is sent. Set the other lines in layout.",
    });
  }
  // Parameters go last and nothing may follow them.
  o.add("param", ` --ar ${r.aspect}`);
  const no = negativeTokens(ctx);
  if (no.length) o.add("param", ` --no ${no.join(", ")}`);
  if (r.midjourney.raw) o.add("param", " --raw");
  if (r.midjourney.stylize !== null)
    o.add("param", ` --s ${r.midjourney.stylize}`);
  if (r.midjourney.sref.length)
    o.add("param", ` --sref ${r.midjourney.sref.join(" ")}`);
  if (no.length > 12) {
    ctx.notices.push({
      level: "warn",
      message: `${no.length} --no terms. Long exclusion lists dilute the prompt; keep the ones you actually see.`,
    });
  }
}

const SDXL_SIZE: Record<Aspect, string> = {
  "1:1": "1024 × 1024",
  "4:5": "896 × 1152",
  "3:4": "896 × 1152",
  "2:3": "832 × 1216",
  "9:16": "768 × 1344",
  "16:9": "1344 × 768",
  "3:2": "1216 × 832",
};

function sdxl(ctx: Context, o: Out, neg: Out): void {
  const { r } = ctx;
  o.add("frame", `${ctx.purpose.noun}, `).add("subject", trimEnd(r.idea));
  if (r.detail.trim()) o.add("subject", `, ${trimEnd(r.detail)}`);
  o.add("frame", ", ").add("design", ctx.design.keywords);
  if (ctx.art) o.add("frame", ", ").add("art", ctx.art.keywords);
  o.add("frame", ", ").add("technique", ctx.technique.keywords);
  o.add("palette", `, ${paletteNames(ctx)} color palette`);
  o.add("type", `, ${ctx.typeEn}`);
  const [head] = ctx.texts;
  if (r.textMode === "space")
    o.add("text", ", empty space at the top for a headline");
  else if (head) {
    o.add("text", `, text ${quote(head)}`);
    ctx.notices.push({
      level: "warn",
      message:
        "SDXL often misspells text. Choose “Leave space” and set the headline in layout.",
    });
  }
  neg.add("avoid", negativeTokens(ctx).join(", "));
  ctx.notices.push({
    level: "info",
    message: `Set the canvas to ${SDXL_SIZE[r.aspect]} (closest SDXL bucket to ${r.aspect}).`,
  });
}

/* ── entry point ─────────────────────────────────────────────────────── */

export function compile(recipe: Recipe): CompiledPrompt {
  const ctx = resolve(recipe);
  const allowed = PATTERNS_BY_TARGET[recipe.target];
  const pattern: PatternId = allowed.includes(recipe.pattern)
    ? recipe.pattern
    : "concise";
  if (pattern !== recipe.pattern) {
    ctx.notices.push({
      level: "info",
      message:
        "This model wants a keyword prompt, so the art-direction pattern is used.",
    });
  }
  if (ctx.lang === "es" && pattern !== "seven-line" && pattern !== "restyle") {
    ctx.notices.push({
      level: "info",
      message:
        "Spanish output is available for the seven-line and restyle patterns.",
    });
  }

  const o = new Out();
  let neg: Out | null = null;
  const flux = recipe.target === "flux";

  if (recipe.target === "midjourney") midjourney(ctx, o);
  else if (recipe.target === "sdxl") {
    neg = new Out();
    sdxl(ctx, o, neg);
  } else {
    if (flux && ctx.cliche.items.length > 0) {
      ctx.notices.push({
        level: "info",
        message:
          "FLUX ignores “no X”, so subject clichés are not sent. Give the Concept field one specific image instead.",
      });
    }
    switch (pattern) {
      case "concise":
        concise(ctx, o, flux);
        break;
      case "seven-line":
        sevenLine(ctx, o, flux);
        break;
      case "spec":
        spec(ctx, o, flux);
        break;
      case "restyle":
        restyle(ctx, o);
        break;
      case "edit":
        edit(ctx, o, flux);
        break;
    }
  }

  return {
    pattern,
    segments: o.segs,
    text: o.text,
    negative: neg?.segs ?? null,
    negativeText: neg?.text ?? null,
    notices: ctx.notices,
    skipped: ctx.skipped,
    baseline: baseline(recipe),
  };
}

/** What a typical undirected request looks like, for comparison. */
export function baseline(r: Recipe): string {
  const purpose = PURPOSES.find((p) => p.id === r.purpose) ?? PURPOSES[0];
  const text =
    r.textMode === "render" && r.headline.trim()
      ? ` The title is "${r.headline.trim()}".`
      : "";
  return `Make a ${purpose.noun}: ${trimEnd(r.idea)}.${text}`;
}
