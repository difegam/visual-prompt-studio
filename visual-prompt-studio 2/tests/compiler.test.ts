import { describe, expect, it } from "vitest";
import { compile, joinList } from "../src/domain/compiler";
import {
  DEFAULT_RECIPE,
  parseRecipe,
  parseRecipeJson,
  type Recipe,
} from "../src/domain/recipe";
import { PRESETS, applyPreset } from "../src/domain/presets";

const r = (patch: Partial<Recipe> = {}): Recipe => ({
  ...DEFAULT_RECIPE,
  ...patch,
});

describe("joinList", () => {
  it("joins with a final conjunction per language", () => {
    expect(joinList(["a", "b", "c"])).toBe("a, b and c");
    expect(joinList(["a", "b"], "es")).toBe("a y b");
    expect(joinList([])).toBe("");
  });
});

describe("GPT Image concise", () => {
  const out = compile(r());
  it("quotes exact text and forbids other text", () => {
    expect(out.text).toContain(
      '"OBJECTS IN MOTION", "14 NOV · 18:00", "GALERIE VRIJTHOF", and no other text',
    );
  });
  it("names palette colors with hex", () => {
    expect(out.text).toContain("signal red (#E2261C)");
  });
  it("includes subject clichés as exclusions", () => {
    expect(out.text).toContain("classical marble busts");
  });
  it("tags every segment with a source and reconstructs the text", () => {
    expect(out.segments.map((s) => s.text).join("")).toBe(out.text);
    expect(new Set(out.segments.map((s) => s.source))).toEqual(
      new Set([
        "frame",
        "subject",
        "design",
        "art",
        "technique",
        "type",
        "palette",
        "text",
        "signature",
        "avoid",
      ]),
    );
  });
});

describe("trait-aware exclusions", () => {
  it("skips texture exclusions when the technique depends on texture", () => {
    const out = compile(
      r({ avoids: ["distressed", "grain", "paper", "glow"] }),
    );
    expect(out.skipped.map((s) => s.id).sort()).toEqual([
      "distressed",
      "grain",
      "paper",
    ]);
    expect(out.text).not.toContain("film grain");
    expect(out.text).toContain("glowing edges");
  });
  it("keeps them for clean digital", () => {
    const out = compile(
      r({
        avoids: ["grain"],
        styles: { ...DEFAULT_RECIPE.styles, technique: "clean" },
      }),
    );
    expect(out.skipped).toHaveLength(0);
    expect(out.text).toContain("film grain");
  });
  it("keeps misregistration for letterpress, skips it for risograph", () => {
    const lp = compile(
      r({
        avoids: ["misregistration"],
        styles: { ...DEFAULT_RECIPE.styles, technique: "letterpress" },
      }),
    );
    expect(lp.skipped).toHaveLength(0);
    const riso = compile(r({ avoids: ["misregistration"] }));
    expect(riso.skipped[0]?.id).toBe("misregistration");
  });
});

describe("typography", () => {
  it("lets own-lettering styles override a chosen font, with a notice", () => {
    const out = compile(
      r({
        font: "inter",
        styles: { design: "art-nouveau", art: "none", technique: "clean" },
      }),
    );
    expect(out.text).toContain("the style's own lettering (Art Nouveau)");
    expect(out.notices.some((n) => n.message.includes("Inter"))).toBe(true);
  });
  it("describes a chosen font by class, not by file", () => {
    const out = compile(r({ font: "oswald" }));
    expect(out.text).toContain("a bold condensed gothic sans-serif");
  });
});

describe("Midjourney", () => {
  const out = compile(
    r({
      target: "midjourney",
      midjourney: { sref: ["ce8bdda"], raw: true, stylize: 250 },
    }),
  );
  it("ends with parameters and nothing after them", () => {
    expect(out.text).toMatch(
      / --ar 4:5 --no [^-]+ --raw --s 250 --sref ce8bdda$/,
    );
  });
  it("uses concrete --no tokens without duplicates", () => {
    const no = out.text.split(" --no ")[1]!.split(" --")[0]!.split(", ");
    expect(new Set(no).size).toBe(no.length);
    expect(no).toContain("marble bust");
  });
  it("forces the keyword pattern", () => {
    expect(compile(r({ target: "midjourney", pattern: "spec" })).pattern).toBe(
      "concise",
    );
  });
});

describe("FLUX", () => {
  const out = compile(r({ target: "flux" }));
  it("never sends negations, only positive rewrites", () => {
    expect(out.text).not.toMatch(/\bavoid\b/i);
    expect(out.text).toContain("flat printed surfaces with no 3D shading");
    expect(out.text).not.toContain("marble");
  });
});

describe("SDXL", () => {
  it("separates the negative prompt and recommends a canvas size", () => {
    const out = compile(r({ target: "sdxl", textMode: "space" }));
    expect(out.negativeText).toContain("watermark");
    expect(out.negativeText).toContain("letters");
    expect(out.text).not.toContain("watermark");
    expect(out.notices.some((n) => n.message.includes("896 × 1152"))).toBe(
      true,
    );
  });
});

describe("seven-line pattern", () => {
  it("produces exactly seven labelled lines in English", () => {
    const lines = compile(r({ pattern: "seven-line" })).text.split("\n");
    expect(lines.map((l) => l.split(":")[0])).toEqual([
      "Format",
      "What it is",
      "Content",
      "Style",
      "Exact text",
      "Typography and palette",
      "Avoid",
    ]);
  });
  it("matches the Spanish guide wording", () => {
    const text = compile(r({ pattern: "seven-line", language: "es" })).text;
    expect(text).toContain("Formato: vertical 4:5");
    expect(text).toContain(
      "Estilo: maquetación Estilo tipográfico internacional (Swiss), ilustración estilo surrealismo, técnica de risografía",
    );
    expect(text).toContain("y ningún otro texto");
    expect(text).toContain(
      "Evita: bustos y estatuas clásicas, pan de oro y brochazos de color. Pinceladas secas; líneas de velocidad",
    );
  });
});

describe("palette rules", () => {
  it("cyanotype dictates Prussian blue", () => {
    const out = compile(
      r({ styles: { ...DEFAULT_RECIPE.styles, technique: "cyanotype" } }),
    );
    expect(out.text).toContain("Prussian blue (#1D4E89)");
  });
});

describe("recipe schema", () => {
  it("accepts the default and every preset", () => {
    expect(parseRecipe(DEFAULT_RECIPE).ok).toBe(true);
    for (const p of PRESETS)
      expect(parseRecipe(applyPreset(DEFAULT_RECIPE, p)).ok).toBe(true);
  });
  it("round-trips through JSON", () => {
    const res = parseRecipeJson(JSON.stringify(DEFAULT_RECIPE));
    expect(res.ok && res.recipe).toEqual(DEFAULT_RECIPE);
  });
  it("rejects unknown styles and bad colors with readable issues", () => {
    const bad = {
      ...DEFAULT_RECIPE,
      styles: { ...DEFAULT_RECIPE.styles, design: "vaporwave" },
      palette: [
        { hex: "red", name: "red" },
        DEFAULT_RECIPE.palette[1],
        DEFAULT_RECIPE.palette[2],
      ],
    };
    const res = parseRecipe(bad);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.issues.some((i) => i.startsWith("styles.design"))).toBe(true);
      expect(res.issues.some((i) => i.includes("6-digit hex"))).toBe(true);
    }
  });
  it("rejects malformed JSON without throwing", () => {
    expect(parseRecipeJson("{oops").ok).toBe(false);
  });
  it("validates Midjourney style references", () => {
    expect(
      parseRecipe({
        ...DEFAULT_RECIPE,
        midjourney: { sref: ["--chaos 100"], raw: false, stylize: null },
      }).ok,
    ).toBe(false);
  });
});

describe("determinism", () => {
  it("compiles identical input to identical output", () => {
    expect(compile(r())).toEqual(compile(r()));
  });
});
