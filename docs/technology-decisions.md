# Technology decisions

Reviewed 2026-10-24. Exact installed dependency versions are recorded in `pnpm-lock.yaml`; direct dependency ranges are in `package.json`.

## Application stack

- Astro owns routing, static page rendering, content collections, and the build.
- React stays in the template for the existing search, announcement, Disqus adapter, and MDX shortcodes. The default site uses Astro for static markup; React hydrates only interactive UI.
- Tailwind CSS 4 uses the official `@tailwindcss/vite` plugin. daisyUI 5 contributes CSS classes and theme tokens; it does not provide widget behavior.
- TypeScript is strict. Shared data contracts belong in collection schemas or component props instead of being inferred from loose DOM conventions.
- Astro's built-in Font API bundles the configured font files during the build. The current Heebo and Signika family names resolve through Google Fonts, so builds need network access. Use locally licensed font files or a system stack when offline builds are required; avoid adding runtime font requests from page components.

The theme value is stored in `document.documentElement.dataset.theme`. The theme switcher, Tailwind `dark:` variant, and daisyUI theme blocks all read that attribute; `scripts/themeGenerator.js` derives the generated CSS from `src/config/theme.json`.

## UI framework evaluation

Astro can render islands from supported UI frameworks, but this starter chooses one interactive framework. Mixing React and Svelte is possible; it also adds another component model, integration, set of conventions, and potential client runtime to maintain.

| Option                              | Strengths                                                                                     | Costs and fit here                                                                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Astro + Tailwind + daisyUI          | Smallest conceptual stack; good for content sites with native HTML interactions.              | Search and the existing MDX components still need a client framework or a rewrite.                                                                                 |
| Astro + Tailwind + daisyUI + React  | Keeps the current search, MDX shortcodes, and integrations. React can be isolated to islands. | Requires care with hydration and client bundle size; don't turn static pages into React apps. This is the selected baseline.                                       |
| Astro + Tailwind + daisyUI + Svelte | A reasonable choice for a new site whose team wants Svelte as its one interactive framework.  | Replacing React means migrating the search and every React shortcode/adapter. Keeping both frameworks would increase maintenance for little value in this starter. |
| Astro with React and Svelte islands | Allows a specific Svelte widget beside existing React UI.                                     | Adds cross-framework conventions and may ship both runtimes. Use only for an independently justified feature and measure its production output.                    |

### Should React be replaced?

React remains. Its practical advantages here are the existing working search and MDX components, a large ecosystem, and one integration already configured. The costs are framework-specific code, hydration decisions, and a browser runtime for interactive islands. Astro keeps those costs scoped; replacing React would not improve the static page layer.

Svelte could be a good single-framework choice for a new project or a site where the team has standardized on it. A migration here would need to replace the search, announcement component, seven MDX shortcodes, and optional Disqus adapter. The likely benefit is lower if most current pages remain static. Revisit only with a concrete team or bundle-size reason, then migrate all interactive UI together rather than leaving two frameworks installed indefinitely.

## Svelte islands

An island is a component that hydrates independently on a mostly static page. Svelte islands are appropriate when a self-contained interaction has a clear boundary, its data can be serialized, and the project accepts another UI framework. Prefer native HTML and small browser modules for simple interactions; use React for existing React components. Avoid introducing a Svelte island just to render a static card or section.

## Vite+

Vite+ (`vp`) can run project scripts, but it does not replace Astro's CLI. In this template, Astro commands should remain explicit package scripts and run as `pnpm run dev`, `pnpm run build`, or `pnpm exec astro ...`. Using Vite+ would require `vp run <script>`; `vp dev` and `vp build` invoke Vite commands and can be confused with Astro's commands. It adds little while this project only needs the package manager to run its scripts.

Do not add Vite+ to the default template. Re-evaluate if the repository adopts a Vite+ capability that Astro and pnpm scripts do not already provide, and first prove the Astro config, dev server, build, and deployment flow work without command ambiguity.

## Runtime and dependency maintenance

- Node.js `22.23.4` is the local baseline in `.nvmrc`, `.node-version`, the container, and CI. Use an even-numbered Node release supported by Astro.
- pnpm `11.17.0` is pinned in `packageManager`; commit `pnpm-lock.yaml` and use frozen installs in automation.
- `pnpm run check` generates the search index before Astro's whole-project check. The development command also refreshes search data before starting Astro.
- `tailwind-bootstrap-grid` is patched at `patches/tailwind-bootstrap-grid@7.0.0.patch` so its defaults work with the patched Zod 4 dependency. Review the patch when upgrading either package.
- Security CI fails on high or critical advisories. On 2026-10-24, `pnpm audit --audit-level high` passes with one moderate transitive advisory in `postcss-selector-parser` through `@tailwindcss/typography`; review current audit output before each release.

## References

- [Astro Node.js requirements](https://docs.astro.build/en/install-and-setup/)
- [Astro framework components](https://docs.astro.build/en/guides/framework-components/)
- [Astro client directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [Tailwind CSS with Astro](https://tailwindcss.com/docs/installation/framework-guides/astro)
- [daisyUI installation](https://daisyui.com/docs/install/)
- [Vite+ run guide](https://viteplus.dev/guide/run)
- [Vite+ Astro integration discussion](https://github.com/voidzero-dev/vite-plus/issues/1506)
