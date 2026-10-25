# Design principles

Why the Studio recommends what it does, and which claims it avoids.

## Purpose

Recommendations should work like a design expert. Start from what the user is making and what the piece must communicate, explain the design logic behind a few suitable directions, and leave room to explore or override each choice. A style name alone is not a recommendation; users need to know what it does to the composition and why it fits their brief.

## What the structure rests on

- **Three independent layers.** The beailabs guide separates style into design movement (layout and typography), art movement (how imagery is drawn) and technique (print finish). It encourages surprising combinations and naming unwanted clichés. This supports several complete suggestions plus independent layer controls.
- **Many valid answers to a brief.** Cooper Hewitt's [How Posters Work](https://www.si.edu/exhibitions/how-posters-work%3Aevent-exhib-5759) frames poster design as a set of moves: focusing the eye, using type as image, simplifying, telling a story, amplifying, manipulating scale, activating diagonals, making a system. Recommendations explain such effects in plain language and tie them to a communication goal. ([Exhibition release](https://www.si.edu/newsdesk/releases/cooper-hewitt-present-special-exhibition-how-posters-work))
- **Provenance of the catalog.** Catalog names and categories derive from John Hartnup's [Poster Prompts](https://john.hartnup.uk/poster-prompts). The descriptions are original. Keep source names and original descriptions distinct.

## The 2026 starters

The six starters translate editorial forecasts and practitioner examples into combinations of existing catalog layers. They are editorial choices, not new design movements or a ranking of current popularity.

- [Figma's web design trends for 2026](https://www.figma.com/resource-library/web-design-trends/): expressive type, saturated color, collage, retrofuturism, maximalism, white space. Only composition guidance applies; web interaction patterns do not belong in a static image prompt.
- [Adobe Express's design trends for 2026](https://www.adobe.com/express/learn/blog/design-trends-2026): sensory materials, organic imperfection, collage, surreal imagery, local storytelling.
- [Adobe's 2026 Creative Trends Forecast](https://business.adobe.com/resources/creative-trends-report.html): sensory imagery, authentic connection, surreal play, local culture. Local details must come from the user's brief, not generic decoration.
- [Behance's Design Trends 2026](https://www.behance.net/gallery/239027109/Design-Trends-2026): raw aesthetics, imperfect lettering, micro-maximalism, chromatic expression. A practitioner synthesis, not a measured ranking.
- [Dribbble's Design Trends](https://dribbble.com/tags/design-trends): a visual index for comparing typography, grids, color and imagery. Likes and views are not research evidence.

These sources support directions worth exploring. They do not show that a starter improves campaign performance or produces better results from an image model. The source registry in `references.ts` records URLs, source types and checked dates.

## Starter behavior contract

Each starter has a principle, a tradeoff and supporting reading. Applying one changes only layout, imagery, finish, palette, typeface, type weight and italics, and creative-intent selections. It preserves the brief, exact text, concept, format, aspect ratio, text mode, exclusions, target model, prompt shape, language, edit instructions and model-specific settings. The user can undo it. The year, source names, principle and tradeoff never enter the compiled prompt, and starter metadata belongs to the catalog, not the recipe schema, so saved recipes stay compatible. (`discovery.ts`, `presets.ts`)

## How discovery is organized

1. Start with the job: format (the artifact) and goal (its intended effect) are separate facets.
2. Recommend by design problem, not only style label, and state the tradeoff of each suggestion.
3. Offer a small set of distinct directions, then let users refine each layer independently.
4. Make the catalog findable with search and filters, and keep filters when paging.
5. Teach while recommending: one concrete concept per suggestion, and a route to browse everything.

## Popularity claims

A local-only app with no accounts or usage telemetry cannot support "most popular", "trending" or usage-count claims. Use honest labels such as **Recommended for this goal**, **Curated pick**, **Good starting point** or **Explore**. A hand-authored ranking is curated, not popular.

## Limits

The museum material is a historical overview, not a usability study or a validated mapping from project types to styles. The guidance is design-informed product reasoning, not evidence that one style performs better. Validate labels and explanations with users if user research enters scope.
