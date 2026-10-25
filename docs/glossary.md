# Glossary

| Term               | Meaning in this project                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Astro component    | A `.astro` file that composes server-rendered HTML, data, and styles. It does not ship browser JavaScript unless it includes a client-side feature. |
| Content collection | A group of Markdown or MDX records validated by a schema in `src/content.config.ts`.                                                                |
| React island       | A React component hydrated in the browser inside an otherwise Astro-rendered page.                                                                  |
| Hydration          | Starting client-side component behavior after HTML has been rendered. Astro's `client:*` directives choose when this happens.                       |
| Taxonomy           | A content classification such as a blog category or tag, with generated index and detail routes.                                                    |
| daisyUI theme      | A set of CSS custom properties and component classes. The current light/dark choice is the root element's `data-theme` value.                       |
| `SITE_MODE`        | Build setting that selects `preview` or `production` SEO and robots behavior.                                                                       |
| Canonical URL      | The configured public URL a page declares as its preferred address. It is assembled using `site.base_url`, `site.base_path`, and the current route. |
| Aspect ratio       | The proportional relationship between the width and height of the requested image, such as `4:5` or `16:9`.                                         |
| Prompt recipe      | A set of a brief, format, visual choices, text, exclusions, and target settings used to compile an image prompt.                                    |
| Prompt target      | The image model or tool whose syntax and constraints shape the compiled prompt.                                                                     |
| Prompt pattern     | The structure used to express a recipe, such as a concise art-direction paragraph or a seven-line brief.                                            |
| Visual layer       | One independent part of the art direction: layout, imagery, or print finish.                                                                        |
| Exclusion          | A named element the prompt should avoid, unless the selected visual style relies on that element.                                                   |
| Compiled prompt    | The target-aware text produced from a prompt recipe, including a separate negative prompt when the target supports it.                              |
