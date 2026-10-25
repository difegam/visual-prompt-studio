import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "vite";

let server;
let api;
let data;
let styles;

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
});

after(async () => {
  await server?.close();
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
  };
  const direction = data.DIRECTIONS.find(({ id }) => id === "gallery");
  const next = api.applyDirection(current, direction);

  assert.equal(next.idea, current.idea);
  assert.equal(next.headline, current.headline);
  assert.equal(next.purpose, current.purpose);
  assert.equal(next.aspect, current.aspect);
  assert.deepEqual(next.styles, direction.patch.styles);
});
