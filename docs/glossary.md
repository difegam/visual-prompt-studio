# Glossary

| Term                 | Meaning in this project                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Astro component      | A `.astro` file that composes server-rendered HTML, data, and styles. It does not ship browser JavaScript unless it includes a client-side feature. |
| Content collection   | A group of Markdown or MDX records validated by a schema in `src/content.config.ts`.                                                                |
| React island         | A React component hydrated in the browser inside an otherwise Astro-rendered page.                                                                  |
| Hydration            | Starting client-side component behavior after HTML has been rendered. Astro's `client:*` directives choose when this happens.                       |
| Taxonomy             | A content classification such as a blog category or tag, with generated index and detail routes.                                                    |
| daisyUI theme        | A set of CSS custom properties and component classes. The current light/dark choice is the root element's `data-theme` value.                       |
| `SITE_MODE`          | Build setting that selects `preview` or `production` SEO and robots behavior.                                                                       |
| Canonical URL        | The configured public URL a page declares as its preferred address. It is assembled using `site.base_url`, `site.base_path`, and the current route. |
| Aspect ratio         | The proportional relationship between the width and height of the requested image, such as `4:5` or `16:9`.                                         |
| Prompt recipe        | A set of a brief, format, visual choices, text, exclusions, and target settings used to compile an image prompt.                                    |
| Prompt target        | The image model or tool whose syntax and constraints shape the compiled prompt.                                                                     |
| Prompt pattern       | The structure used to express a recipe, such as a concise art-direction paragraph or a seven-line brief.                                            |
| Visual layer         | One independent part of the art direction: layout, imagery, or print finish.                                                                        |
| Exclusion            | A named element the prompt should avoid, unless the selected visual style relies on that element.                                                   |
| Compiled prompt      | The target-aware text produced from a prompt recipe, including a separate negative prompt when the target supports it.                              |
| Direction comparison | A session-only, side-by-side view of two visual directions. Neither is applied until the user chooses one.                                          |
| Example brief        | An editorial sample brief for one format, loaded by a "Try an example" pill. It replaces only the brief fields and is not usage data.               |
| Starter edition      | A dated, editorially chosen set of starter directions (for example, 2026). Not evidence of popularity.                                              |
| Guided path          | The default way through the Studio: a short sequence of steps that offers a few choices at a time and a recommended next move.                      |
| Step                 | One stage of the guided path (Describe, Look, Refine, Send). Steps are never locked; the user can jump to any of them.                              |
| Main road            | The minimal set of choices on the guided path that is enough to produce a copyable prompt.                                                          |
| Detour               | An optional side route from a step (such as browsing all directions) that returns to the same step.                                                 |
| Advanced option      | A control kept out of the main road, collapsed but reachable from any step.                                                                         |
| Expert view          | A remembered user preference that turns off the guided path and shows every control at once.                                                        |
