import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const siteMode = process.argv[2];

if (siteMode !== "preview" && siteMode !== "production") {
  console.error("Usage: node scripts/build.mjs <preview|production>");
  process.exit(2);
}

const environment = { ...process.env, SITE_MODE: siteMode };
const astroCli = path.join(
  projectRoot,
  "node_modules",
  "astro",
  "bin",
  "astro.mjs",
);

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: environment,
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(process.execPath, ["scripts/themeGenerator.js"]);
run(process.execPath, ["scripts/jsonGenerator.js"]);
run(process.execPath, [astroCli, "check"]);
run(process.execPath, [astroCli, "build"]);
run(process.execPath, ["scripts/llmsGenerator.js"]);
run(process.execPath, ["scripts/validate-build.mjs"]);
