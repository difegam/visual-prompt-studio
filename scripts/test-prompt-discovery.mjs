import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "vite";
import { parse } from "node-html-parser";

let server;
let api;
let data;
let styles;
let references;
let recipe;
let cards;

before(async () => {
  server = await createServer({
    configFile: false,
    appType: "custom",
    logLevel: "silent",
    server: { middlewareMode: true },
  });
  api = await server.ssrLoadModule(
    "/src/lib/prompt-studio/domain/discovery.ts",
  );
  data = await server.ssrLoadModule("/src/lib/prompt-studio/domain/presets.ts");
  styles = await server.ssrLoadModule(
    "/src/lib/prompt-studio/domain/styles.ts",
  );
  references = await server.ssrLoadModule(
    "/src/lib/prompt-studio/domain/references.ts",
  );
  recipe = await server.ssrLoadModule(
    "/src/lib/prompt-studio/domain/recipe.ts",
  );
  cards = await server.ssrLoadModule("/src/lib/prompt-studio/ui/directions.ts");
});

after(async () => {
  await server?.close();
});

test("suggested starters explain their layers and link to their first resolved source", () => {
  const starter = data.DIRECTIONS.find(({ trendYear }) => trendYear === 2026);
  const source = references.getReference(starter.sourceIds[0]);
  const html = cards.renderDirectionCard(
    { ...starter, sourceIds: ["missing", ...starter.sourceIds] },
    { variant: "suggested", goal: "attention", selected: true },
  );
  const card = parse(html);
  assert.ok(card.textContent.includes("2026 starter"));
  assert.ok(card.textContent.includes(starter.principle));
  assert.ok(card.textContent.includes(starter.tradeoff));
  assert.equal(card.querySelector("article").getAttribute("role"), "listitem");
  const layers = card.querySelector('ul[aria-label="Visual layers"]');
  assert.equal(layers.querySelectorAll("li").length, 3);
  for (const styleId of Object.values(starter.patch.styles)) {
    assert.ok(layers.textContent.includes(styles.getStyle(styleId).name));
  }
  const link = card.querySelector("a");
  assert.equal(link.textContent, `Learn with ${source.name}`);
  assert.equal(link.getAttribute("href"), source.url);
  assert.equal(link.getAttribute("target"), "_blank");
  assert.equal(link.getAttribute("rel"), "noopener noreferrer");
  const button = card.querySelector("button");
  assert.equal(button.textContent, "Use this starter");
  assert.equal(button.getAttribute("data-preset"), starter.id);
  assert.equal(button.getAttribute("aria-pressed"), "true");
  assert.ok(card.querySelector("svg"));
  for (const color of starter.patch.palette)
    assert.ok(html.includes(color.hex));
});

test("explorer starters use native learning disclosure and retain delegation", () => {
  const starter = data.DIRECTIONS.find(({ trendYear }) => trendYear === 2026);
  const card = parse(
    cards.renderDirectionCard(starter, {
      variant: "explorer",
      goal: "attention",
      selected: false,
    }),
  );
  const details = card.querySelector("details.direction-learning");
  assert.ok(details.querySelector("summary"));
  assert.ok(details.textContent.includes(starter.principle));
  assert.ok(details.textContent.includes(starter.tradeoff));
  assert.ok(details.querySelector("a"));
  assert.equal(
    card.querySelector("button").getAttribute("data-preset"),
    starter.id,
  );
  assert.equal(
    card.querySelector("button").getAttribute("aria-pressed"),
    "false",
  );
  assert.equal(card.querySelector("article").getAttribute("role"), "listitem");
});

test("legacy directions omit educational markup in both variants", () => {
  const legacy = data.DIRECTIONS.find(({ trendYear }) => !trendYear);
  for (const variant of ["suggested", "explorer"]) {
    const card = parse(
      cards.renderDirectionCard(legacy, {
        variant,
        goal: "attention",
        selected: false,
      }),
    );
    assert.equal(
      card.querySelector("button").textContent,
      "Use this direction",
    );
    assert.equal(card.querySelector(".direction-learning"), null);
    assert.equal(card.querySelector(".direction-principle"), null);
    assert.equal(card.querySelector(".direction-tradeoff"), null);
    assert.equal(card.querySelector("a"), null);
    assert.ok(!card.textContent.includes("2026 starter"));
  }
});

test("direction cards escape text and attributes and skip unresolved learning links", () => {
  const starter = data.DIRECTIONS.find(({ trendYear }) => trendYear === 2026);
  for (const variant of ["suggested", "explorer"]) {
    const card = parse(
      cards.renderDirectionCard(
        {
          ...starter,
          id: 'test" data-injected="yes',
          name: '<img src=x onerror="bad">',
          principle: "<script>bad</script>",
          tradeoff: "A & B",
          sourceIds: ["missing"],
        },
        { variant, goal: "attention", selected: false },
      ),
    );
    assert.equal(card.querySelector("script, img, [data-injected]"), null);
    assert.ok(card.textContent.includes("<script>bad</script>"));
    assert.ok(card.textContent.includes("A & B"));
    assert.equal(card.querySelector("a"), null);
    assert.equal(
      card.querySelector("button").getAttribute("data-preset"),
      'test" data-injected="yes',
    );
  }
});

function validateStarter(direction) {
  assert.ok(direction.principle?.trim(), `${direction.id} needs a principle`);
  assert.ok(direction.tradeoff?.trim(), `${direction.id} needs a tradeoff`);
  assert.ok(direction.sourceIds?.length, `${direction.id} needs sources`);
  assert.equal(new Set(direction.sourceIds).size, direction.sourceIds.length);
  for (const sourceId of direction.sourceIds) {
    assert.ok(references.getReference(sourceId), `Unknown source: ${sourceId}`);
  }
  assert.ok(direction.formats.length);
  assert.ok(direction.goals.length);
  for (const format of direction.formats) {
    assert.ok(recipe.PURPOSES.some(({ id }) => id === format));
  }
  for (const goal of direction.goals) {
    assert.ok(api.GOALS.some(({ id }) => id === goal));
    assert.ok(direction.rationale[goal]?.trim());
  }
  for (const key of [
    "styles",
    "palette",
    "font",
    "fontWeight",
    "fontItalic",
    "signatures",
  ]) {
    assert.ok(
      Object.hasOwn(direction.patch, key),
      `${direction.id} needs ${key}`,
    );
  }
  assert.equal(direction.patch.palette.length, 3);
  assert.ok(direction.patch.signatures.length);
  assert.equal(direction.patch.fontItalic, false);
  assert.ok(
    recipe.RecipeSchema.safeParse({
      ...recipe.DEFAULT_RECIPE,
      ...direction.patch,
    }).success,
    `${direction.id} must contain valid recipe values`,
  );
}

test("2026 starters have complete valid educational metadata", () => {
  const starters = data.DIRECTIONS.filter(
    ({ trendYear }) => trendYear === 2026,
  );
  assert.deepEqual(
    starters.map(({ id }) => id),
    [
      "raw-human-voice",
      "one-loud-detail",
      "chromatic-pulse",
      "soft-surreal-tactility",
      "local-cut-paper-story",
      "retro-future-grid",
    ],
  );
  for (const starter of starters) validateStarter(starter);
});

test("starter validation rejects an unresolved learning source", () => {
  const starter = data.DIRECTIONS.find(({ id }) => id === "raw-human-voice");
  assert.ok(starter, "Raw human voice must exist before checking its sources");
  assert.throws(
    () => validateStarter({ ...starter, sourceIds: ["missing"] }),
    /Unknown source: missing/,
  );
});

test("reference lookup resolves catalog entries and leaves unknown IDs unresolved", () => {
  assert.equal(typeof references.getReference, "function");
  for (const reference of references.REFERENCES) {
    assert.equal(references.getReference(reference.id), reference);
  }
  assert.equal(references.getReference("missing"), undefined);
});

test("recommendations prefer exact format and goal matches", () => {
  const directions = api.getRecommendations("poster", "attention");
  assert.ok(directions.length >= 2);
  assert.ok(
    directions.every(
      (direction) =>
        direction.formats.includes("poster") &&
        direction.goals.includes("attention"),
    ),
  );
});

test("2026 starters appear among the first four relevant recommendations", () => {
  for (const [format, goal] of [
    ["poster", "attention"],
    ["social", "atmosphere"],
  ]) {
    assert.ok(
      api
        .getRecommendations(format, goal, 4)
        .some(({ trendYear }) => trendYear === 2026),
      `${format} / ${goal} should recommend a 2026 starter`,
    );
  }
});

test("recommendations fall back deterministically without duplicate directions", () => {
  const first = api.getRecommendations("album-cover", "explain", 10);
  const second = api.getRecommendations("album-cover", "explain", 10);
  assert.deepEqual(
    first.map(({ id }) => id),
    second.map(({ id }) => id),
  );
  assert.equal(new Set(first.map(({ id }) => id)).size, first.length);
  assert.ok(first.length > 0);
  assert.ok(first[0].goals.includes("explain"));
});

test("every supported format and communication goal has useful directions", async () => {
  const { PURPOSES } = await server.ssrLoadModule(
    "/src/lib/prompt-studio/domain/recipe.ts",
  );
  for (const { id: format } of PURPOSES) {
    for (const { id: goal } of api.GOALS) {
      const directions = api.getRecommendations(format, goal, 100);
      assert.ok(directions.length > 0, `${format} / ${goal} should be covered`);
      assert.equal(
        new Set(directions.map(({ id }) => id)).size,
        directions.length,
        `${format} / ${goal} directions should not duplicate`,
      );
    }
  }
});

test("direction search and format filters combine", () => {
  const { DIRECTIONS } = data;
  const matches = api.filterDirections(DIRECTIONS, {
    query: "jazz",
    format: "poster",
  });
  assert.ok(matches.length > 0);
  assert.ok(matches.every((direction) => direction.formats.includes("poster")));
  assert.equal(
    api.filterDirections(DIRECTIONS, { query: "jazz", format: "book-cover" })
      .length,
    0,
  );
});

test("trend filtering selects only 2026 starters and clears with all", () => {
  assert.deepEqual(
    api
      .filterDirections(data.DIRECTIONS, { trendYear: 2026 })
      .map(({ trendYear }) => trendYear),
    Array(6).fill(2026),
  );
  assert.deepEqual(
    api.filterDirections(data.DIRECTIONS, { trendYear: "all" }),
    data.DIRECTIONS,
  );
  assert.deepEqual(api.filterDirections(data.DIRECTIONS, {}), data.DIRECTIONS);
});

test("direction search includes principles, tradeoffs, and resolved source names", () => {
  for (const query of [
    "authored rather than automated",
    "dense supporting copy",
    "Adobe Express",
  ]) {
    assert.ok(
      api
        .filterDirections(data.DIRECTIONS, { query })
        .some(({ id }) => id === "raw-human-voice"),
      `Raw human voice should match ${query}`,
    );
  }
});

test("trend, text, format, goal, style, and curated filters share an intersection", () => {
  const filters = {
    trendYear: 2026,
    query: "authored rather than automated",
    format: "poster",
    goal: "attention",
    styleId: "dada-collage",
    curatedOnly: true,
  };
  assert.deepEqual(
    api.filterDirections(data.DIRECTIONS, filters).map(({ id }) => id),
    ["raw-human-voice"],
  );
  assert.deepEqual(
    api.filterDirections(data.DIRECTIONS, { ...filters, format: "book-cover" }),
    [],
  );
});

test("direction filters can narrow by a specific style from any visual layer", () => {
  const { DIRECTIONS } = data;
  const matches = api.filterDirections(DIRECTIONS, { styleId: "surrealism" });
  assert.ok(matches.length > 0);
  assert.ok(
    matches.every((direction) =>
      Object.values(direction.patch.styles).includes("surrealism"),
    ),
  );
});

test("text, format, goal, and style filters return their shared intersection", () => {
  const matches = api.filterDirections(data.DIRECTIONS, {
    query: "literary",
    format: "book-cover",
    goal: "story",
    styleId: "surrealism",
  });
  assert.deepEqual(
    matches.map(({ id }) => id),
    ["book"],
  );
});

test("pagination clamps page bounds and reports empty results", () => {
  const { paginateItems } = api;
  assert.deepEqual(paginateItems([1, 2, 3, 4], 2, 2), {
    items: [3, 4],
    page: 2,
    pageCount: 2,
    total: 4,
  });
  assert.deepEqual(paginateItems([1, 2, 3, 4], 9, 2), {
    items: [3, 4],
    page: 2,
    pageCount: 2,
    total: 4,
  });
  assert.deepEqual(paginateItems([], 4, 6), {
    items: [],
    page: 1,
    pageCount: 0,
    total: 0,
  });
});

test("style search and curated filtering combine", () => {
  const matches = api.filterStyles(styles.STYLES, {
    query: "swiss",
    curatedOnly: true,
  });
  assert.ok(matches.some(({ id }) => id === "swiss"));
  assert.ok(matches.every(({ curated }) => curated));
  assert.equal(
    api.filterStyles(styles.STYLES, { query: "swiss", group: "Ink and print" })
      .length,
    0,
  );
});

test("applying a direction changes its visual layers and preserves the user's brief", async () => {
  const { DEFAULT_RECIPE } = await server.ssrLoadModule(
    "/src/lib/prompt-studio/domain/recipe.ts",
  );
  const current = {
    ...DEFAULT_RECIPE,
    idea: "An exhibition about tidal wetlands",
    headline: "TIDELINE",
    purpose: "album-cover",
    aspect: "1:1",
    font: "inter",
    fontWeight: "bold",
    fontItalic: true,
    signatures: ["material"],
  };
  const direction = data.DIRECTIONS.find(({ id }) => id === "gallery");
  const next = api.applyDirection(current, direction);

  assert.equal(next.idea, current.idea);
  assert.equal(next.headline, current.headline);
  assert.equal(next.purpose, current.purpose);
  assert.equal(next.aspect, current.aspect);
  assert.deepEqual(next.styles, direction.patch.styles);
  assert.notEqual(next.styles, direction.patch.styles);
  assert.deepEqual(
    next.palette,
    styles.getStyle(direction.patch.styles.design).palette,
  );
  assert.notEqual(
    next.palette,
    styles.getStyle(direction.patch.styles.design).palette,
  );
  assert.equal(next.font, current.font);
  assert.equal(next.fontWeight, current.fontWeight);
  assert.equal(next.fontItalic, current.fontItalic);
  assert.deepEqual(next.signatures, current.signatures);
});

test("applying a starter changes only the safe bundle and clones mutable values", () => {
  const current = {
    ...recipe.DEFAULT_RECIPE,
    idea: "  An exhibition about tidal wetlands  ",
    purpose: "album-cover",
    aspect: "1:1",
    customAspects: ["7:5"],
    headline: "TIDELINE  ",
    extraText: ["  25 OCT", "Keep this exact"],
    textMode: "space",
    detail: "  One reed bends across the composition  ",
    styles: { design: "swiss", art: "surrealism", technique: "risograph" },
    palette: [
      { hex: "#000000", name: "ink" },
      { hex: "#FFFFFF", name: "paper" },
      { hex: "#0000FF", name: "blue" },
    ],
    font: "inter",
    fontWeight: "regular",
    fontItalic: true,
    signatures: ["restraint"],
    avoids: ["dry-brush"],
    cliche: "none",
    target: "midjourney",
    pattern: "seven-line",
    language: "es",
    edit: { change: "  Change the reed", preserve: "Keep the water  " },
    midjourney: {
      sref: ["12345", "https://example.com/style.png"],
      raw: false,
      stylize: 275,
    },
  };
  const starter = data.DIRECTIONS.find(({ id }) => id === "raw-human-voice");
  const protectedKeys = [
    "version",
    "idea",
    "purpose",
    "aspect",
    "customAspects",
    "headline",
    "extraText",
    "textMode",
    "detail",
    "avoids",
    "cliche",
    "target",
    "pattern",
    "language",
    "edit",
    "midjourney",
  ];
  const currentBefore = JSON.stringify(current);
  const catalogBefore = JSON.stringify(starter);
  const next = api.applyDirection(current, starter);

  for (const key of [
    "styles",
    "palette",
    "font",
    "fontWeight",
    "fontItalic",
    "signatures",
  ]) {
    assert.deepEqual(
      next[key],
      starter.patch[key],
      `${key} should use the starter value`,
    );
    assert.notDeepEqual(next[key], current[key], `${key} should change`);
  }
  for (const key of protectedKeys) {
    assert.deepEqual(next[key], current[key], `${key} must be preserved`);
    assert.equal(JSON.stringify(next[key]), JSON.stringify(current[key]));
  }
  // A patch may carry other recipe fields, but applying a direction must ignore them.
  const unsafePatch = {
    ...starter.patch,
    ...Object.fromEntries(
      protectedKeys.map((key) => [key, recipe.DEFAULT_RECIPE[key]]),
    ),
  };
  assert.deepEqual(
    api.applyDirection(current, { ...starter, patch: unsafePatch }),
    next,
  );
  assert.notEqual(next.styles, starter.patch.styles);
  assert.notEqual(next.palette, starter.patch.palette);
  assert.notEqual(next.signatures, starter.patch.signatures);
  for (let i = 0; i < next.palette.length; i++)
    assert.notEqual(next.palette[i], starter.patch.palette[i]);
  next.palette[0].hex = "#ABCDEF";
  next.signatures.push("concept");
  assert.deepEqual(
    api.applyDirection(current, starter).palette,
    starter.patch.palette,
  );
  assert.deepEqual(
    api.applyDirection(current, starter).signatures,
    starter.patch.signatures,
  );
  assert.equal(JSON.stringify(current), currentBefore);
  assert.equal(JSON.stringify(starter), catalogBefore);
});
