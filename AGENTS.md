<!-- BEGIN:astro-agent-rules -->

# Astro: ALWAYS read docs before coding

Before any Astro work, connect to the "Astro docs" MCP server configured in `.mcp.json` to find and read the relevant documentation. Your training data is outdated — the docs are the source of truth.

<!-- END:astro-agent-rules -->

<!-- BEGIN:astro-template-guidance-rules -->

# Astro Template Architecture: ALWAYS read template guidance

Before modifying the template structure, styles, pages, or configuration, trigger the `astro-template-guidance` skill to read the relevant architectural documentation. This ensures you follow the project's established conventions instead of inventing your own.

<!-- END:astro-template-guidance-rules -->

# Browser verification

Verify UI changes (especially Prompt Studio, `/`) in a real browser with `playwright-cli`; config lives in `.playwright/cli.config.json`.

- Start `pnpm dev` first (serves on `http://localhost:4321`), then `playwright-cli open` and `playwright-cli goto http://localhost:4321/` (`baseURL` is not honored; use full URLs).
- Prefer `snapshot` and `console` over screenshots. Use `--mobile` or `resize` for responsive checks.
- Use the Chrome DevTools MCP for Lighthouse, performance traces, and a11y audits.
- Output goes to `.playwright-cli/` (gitignored). Never commit it.
- The global CLI runs on the shell's Node; the project needs the version in `.nvmrc` (see `scripts/with-node.sh`).
