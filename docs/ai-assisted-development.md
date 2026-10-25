# AI-assisted development

AI tools are optional contributors. Keep changes aligned with this repository's instructions and verify generated code against the project, current documentation, and build output.

## Start with project context

Before asking an agent to change code, have it read the root `AGENTS.md` and the relevant project guide. The guides record decisions that a generic Astro or React prompt will miss:

- [Content authoring](content-authoring.md) covers content collections and authoring rules.
- [Git hooks and quality checks](git-hooks.md) describes local and CI checks.

The current baseline is Astro 7, React 19, Tailwind CSS 4, daisyUI 5, and strict TypeScript. Astro owns static pages and content; React remains for the existing search and theme UI. Follow the existing patterns and inspect the relevant files before proposing a new abstraction.

## Documentation and skills

### Astro

Use the official [Astro guide for building with AI](https://docs.astro.build/en/guides/build-with-ai/) for current agent setup and documentation access. This repository already declares the Astro Docs MCP server in `.mcp.json`; use it when the agent host supports project MCP configuration. For hosts without MCP support, consult the official Astro docs directly and verify version-specific APIs against the Astro version in `package.json` and `pnpm-lock.yaml`.

### daisyUI

The [daisyUI skill guide](https://daisyui.com/docs/skill/) offers optional component, utility-class, and theme guidance for coding agents. To add it to a Codex workspace, the guide currently documents:

```sh
npx skills add saadeghi/daisyui --agent codex --yes
```

Ask for it explicitly when authoring daisyUI UI, for example: “Use the daisyUI skill to build this form, following this project's theme and accessibility conventions.” The skill is an optional aid; review its suggestions against daisyUI 5 and this repository's implementation. The daisyUI docs also recommend its MCP option for on-demand documentation when available. Keep such tooling outside the starter's required runtime dependencies.

For package-specific questions, a docs lookup tool such as Context7 can help retrieve current references. Prefer the framework or package's official documentation when checking behavior or breaking changes.

### Browser automation

Agents drive a real browser with [`playwright-cli`](https://github.com/microsoft/playwright-cli); no test runner dependency is added. Install it once with `npm install -g @playwright/cli@latest`. The shared config in `.playwright/cli.config.json` loads automatically: Chrome, an in-memory profile, and a 1440×900 viewport. The CLI ignores `baseURL`, so pass full URLs.

```sh
pnpm dev                     # start the site first
playwright-cli open          # Chrome by default
playwright-cli goto http://localhost:4321/
playwright-cli snapshot
playwright-cli console
playwright-cli close
```

Use `open --browser=firefox` or `--browser=webkit` for cross-browser checks and `open --mobile` for responsive layouts. Output lands in the gitignored `.playwright-cli/` directory. For Lighthouse, performance, and accessibility audits, use the Chrome DevTools MCP instead.

## Project-specific implementation guidance

- **Render with Astro first.** Keep content, layouts, and page structure as static Astro output. Add hydration only for browser behavior that needs state, and choose the narrowest suitable `client:*` directive.
- **Keep React.** Use the existing React components for their current interactions. Do not add Svelte or another UI framework for a static component or a one-off preference.
- **Use the existing styling system.** Tailwind CSS 4 is connected through `@tailwindcss/vite`; daisyUI 5 supplies classes and theme tokens. daisyUI classes do not supply interaction behavior. The theme is selected through `document.documentElement.dataset.theme`; `src/config/theme.json` is the source for generated theme CSS.
- **Earn shared components.** Generalize a component when it represents a stable content contract, interaction, accessibility behavior, or repeated pattern. For a single use, keep markup near its call site.
- **Preserve content and output contracts.** Use the collection schemas and existing config. Keep informative image alt text, canonical URLs, taxonomy links, preview noindex behavior, and robots output valid when changing related code.
- **Use repository scripts.** Run project commands through `pnpm` scripts in `package.json`; these may prepare generated inputs before invoking Astro. Edit the source configuration or content rather than generated search/theme output.

## Review AI-generated changes

Review the actual diff and run checks appropriate to the change. For application changes, the standard project checks are:

```sh
pnpm run lint
pnpm run format:check
pnpm run check
pnpm run build
```

Use `pnpm run build:preview` as well when changing preview, robots, or deployment behavior. The build validates generated routes and metadata in addition to compiling the site. Local Git hooks provide early feedback; CI remains the shared enforcement point. See [Git hooks and quality checks](git-hooks.md).

Treat generated prose, metadata, and asset suggestions as drafts: check factual claims, links, accessibility, and asset licensing before publishing. Never include secrets or private data in prompts to external AI services.

## Task prompt

```text
Read AGENTS.md and the relevant docs before editing. Inspect the current implementation and follow this project's Astro 7, React 19, Tailwind 4, and daisyUI 5 conventions. Keep static rendering in Astro, use React for existing or clearly justified interactive UI, and add shared components only for a real reusable contract. Preserve content, accessibility, theme, and build-output behavior. Make the smallest complete change, run the relevant pnpm quality checks, and report the changed files, verification results, and any remaining tradeoffs.
```
