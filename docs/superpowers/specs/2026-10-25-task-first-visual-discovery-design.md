# Task-first visual discovery

## Intent

Make Visual Prompt Studio feel like an experienced design partner. A user should be able to describe a project, choose what the image needs to communicate, and see several useful visual directions with a plain explanation of why each could fit. The user chooses a direction, then can refine its layout, imagery, and finish.

## Goals

- Make expert guidance the first discovery experience.
- Recommend by both project format and communication goal.
- Explain the design reasoning behind every recommendation.
- Keep suggestions selectable and all three style layers editable.
- Let users explore the full recipe and style catalogs with search, filters, groups, popularity labels, and pagination.
- Keep the app deterministic and local-first.

## Non-goals

- Image generation, external recommendation APIs, accounts, or shared user libraries.
- Claims that a recommendation guarantees better model output or campaign performance.
- Replacing the current prompt compiler, target-specific output, or three-layer style model.
- Automatically locking or hiding styles after a recommendation is selected.

## Anti-goals

- Do not label items popular based on invented usage counts.
- Do not make a recommendation feel like a single correct answer.
- Do not use style names alone as explanations; tell the user what the design choice does.

## What exists today

The home page contains the full composer. It already collects a brief and a project format, offers ten quick-start recipes, and lets the user select layout, imagery, and finish from three style panels. The panels are unfiltered lists. Search and popular filtering exist only in the font picker. There is no goal field, contextual recommendation step, recipe directory, or catalog pagination.

The supplied beailabs guide describes a seven-line prompt and asks users to compare named directions against the same brief. It separates visual language into layout, imagery, and print technique, and recommends naming unwanted clichés while giving positive visual replacements. The project's existing domain modules implement the three-layer model. Cooper Hewitt's _How Posters Work_ adds communication strategies such as focusing attention, using type as image, simplifying, telling a story, amplifying, and activating a diagonal. See `docs/research/visual-prompt-recommendation-principles.md`.

## Approaches

- **Task-first discovery, selected:** show explained recipe directions for the selected project format and goal, then let the user refine each style layer. This makes design guidance central and builds on the current composer and recipe model.
- **Style-first catalog:** add search, filters, groups, pagination, and curated popularity to each of the three style panels. This improves browsing, but leaves users to assemble a fitting combination without much guidance.
- **Separate inspiration library:** add a dedicated discovery route for recipes and styles. This allows more room for browsing, but splits discovery from the composer and adds a new page and navigation path.

The user selected task-first discovery. They want the app to act as a design expert that teaches useful principles while leaving room for choice, experimentation, and discovery.

## Proposed experience

1. Keep the current brief and project-format controls. Add a concise communication-goal choice, with user-facing language grounded in poster design principles. Candidate goals include focus attention, tell a story, explain clearly, create atmosphere, and make a bold statement. Final labels should match the catalog and remain easy to understand.
2. After the user has a format and goal, show several complete directions at once. Each direction names its layout, imagery, and finish and includes a short explanation that ties those choices to the selected goal. The user chooses a direction to apply it. This is the implementation call based on the user's preference for choosing among directions.
3. Keep every direction editable in the existing three style panels. A recommendation is a starting recipe, not a constraint.
4. Add an "Explore all directions" view in the composer. Search recipes by name, summary, goal, format, and included styles. Filter by format, goal, and style layer. Group matches by communication goal or project format. Include a curated "Popular" label and popularity ordering, clearly editorial rather than usage-based.
5. Add search, relevant filters, group labels, curated popular markers, and pagination to the individual style panels. Search style name, summary, era, and descriptive terms. Changing search or filters returns the panel to its first page.
6. Use static recommendation metadata and deterministic matching. Contextual suggestions and curated popularity require no network requests or usage tracking. Choosing a recommendation applies its existing recipe fields; recommendation context itself does not need to change prompt compilation.

The number of direction cards, exact page size, and responsive arrangement are implementation calls guided by the current grid and device widths.

## Constraints

- Preserve the Astro page and vanilla TypeScript app architecture. Interactive behavior currently lives in `src/lib/prompt-studio/ui/app.ts` and the markup in `src/layouts/components/PromptStudio.astro`.
- Preserve the local-first behavior and existing recipe storage and import/export compatibility.
- Keep recommendation data and rationale text static and reviewable in the domain catalog.
- Do not claim real popularity or recommendation success without data.
- Use daisyUI 5 conventions already present in the project when adding HTML controls and components.
- Follow the Astro docs and template guidance for page, component, and styling changes.

## Research basis

- Supplied files: `docs/guia-de-estilos-y-generación-de-carteles-beailabs.pdf` and its extracted text, `docs/guia-de-estilos-y-generación-de-carteles-beailabs.md`.
- Cooper Hewitt, [_How Posters Work_](https://www.cooperhewitt.org/publications/how-posters-work/).
- Cooper Hewitt, [exhibition overview and visual strategies](https://www.cooperhewitt.org/2015/02/05/cooper-hewitt-to-present-special-exhibition-how-posters-work/).
- Research summary and limits: `docs/research/visual-prompt-recommendation-principles.md`.

## Remaining design calls for the builder

- Map each existing recipe to one or more project formats and communication goals. Add recipes only where the current set leaves a clear gap.
- Define concise rationale strings that name the relevant visual effect and the recipe layers that create it.
- Choose search/filter control placement, page size, and empty states to fit the existing composer at mobile and desktop widths.
- Ensure filter combinations, keyboard interaction, and pagination work together without losing the user's current recipe.
