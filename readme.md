# Visual Prompt Studio

A local-first, copy-first composer for art-directed image prompts. Describe the image, choose a format, layered style, palette, type and exclusions, and the Studio compiles a structured prompt tuned for the image model you pick. It does not generate images or send recipe data to a server.

## Where it started

The seven-line prompt structure and the layered view of style come from two Spanish-language resources:

- Video: [Deja de generar imágenes genéricas con ChatGPT](https://www.youtube.com/watch?v=FX8c_ytLuIQ)
- Post: [Crear imágenes con ChatGPT: estilos, prompts y ejemplos](https://beailabs.beehiiv.com/p/crear-imagenes-chatgpt), by Beatriz Ruiz García (beailabs)

The site's About page and blog post tell the story in more detail.

## Features

- Nine aspect ratios, eight formats, five model targets, each with a suitable prompt structure.
- Independent layout, imagery and finish styles, with palettes and type specimens.
- Exact poster text, or a reserved clean area for typesetting later.
- Exclusions, with style-dependent ones called out and skipped automatically.
- Validated JSON import and export. The same schema validates browser storage.
- Blog and About pages, light and dark themes, search.

## Run

Requirements: Node.js `22.23.4` or newer (an even-numbered release) and pnpm `11.17.0`.

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

Checks and builds:

```sh
pnpm run lint
pnpm run format:check
pnpm run check          # refreshes the search index, then runs astro check
pnpm run build          # production mode
pnpm run build:preview  # noindex preview mode
```

The build also validates routes, canonical URLs, image alt text, taxonomy links, the sitemap and robots output. Lefthook installs Git hooks on install; see [Git hooks](docs/git-hooks.md).

## Project layout

| Path                            | What it holds                                                |
| ------------------------------- | ------------------------------------------------------------ |
| `src/pages/index.astro`         | The Studio (`/`)                                             |
| `src/lib/prompt-studio/domain/` | Typed data and the prompt compiler                           |
| `src/lib/prompt-studio/ui/`     | Browser-side app, sketch preview and Studio CSS              |
| `src/layouts/components/`       | `PromptStudio` and the `Studio*` components, blog components |
| `src/content/`                  | Blog posts, authors and the About page                       |
| `src/config/`                   | Site, menu and theme configuration                           |

See [content authoring](docs/content-authoring.md) for writing posts and [deployment](docs/deployment.md) for the Cloudflare Workers workflows.

## AI-assisted development

Project instructions and an Astro Docs MCP configuration are included for agents. See [AI-assisted development](docs/ai-assisted-development.md).

## License and source

The code is MIT licensed and built on [Astroplate](https://github.com/zeon-studio/astroplate) by Zeon Studio. See [LICENSE](LICENSE) and [upstream provenance](docs/UPSTREAM.md). Review third-party package licenses and any assets you add before distributing a derived site.
