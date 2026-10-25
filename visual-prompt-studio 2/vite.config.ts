import { defineConfig } from "vitest/config";
import { viteSingleFile } from "vite-plugin-singlefile";

// Two outputs from one codebase:
//  - default: a multi-file static site (dist/) for any static host.
//  - --mode single: one self-contained HTML file (dist-single/) with fonts inlined,
//    used for sandboxed previews where downloads and external hosts are blocked.
export default defineConfig(({ mode }) => {
  const single = mode === "single";
  return {
    base: "./",
    define: {
      __SINGLE_FILE__: JSON.stringify(single),
    },
    plugins: single ? [viteSingleFile()] : [],
    build: {
      outDir: single ? "dist-single" : "dist",
      target: "es2023",
      assetsInlineLimit: single ? 100_000_000 : 4096,
      emptyOutDir: true,
    },
    test: {
      include: ["tests/**/*.test.ts"],
      environment: "node",
    },
  };
});
