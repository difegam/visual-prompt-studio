# Visual prompt recommendation principles

## Purpose

Recommendations should make the studio feel like a design expert: start from what the user is making and what the piece must communicate, explain the design logic behind a few suitable directions, and leave room to explore or override each choice. A style name alone is not a recommendation; users need to understand what it will do to the composition and why that fits their brief.

## Findings

- The supplied beailabs guide recommends comparing named styles while keeping the subject and prompt structure constant. It separates style into three independent layers: design movement for layout and typography, art movement for how imagery is drawn, and technique for print finish. It also encourages surprising combinations, explains the seven-line prompt structure, and advises naming unwanted clichés while supplying a positive direction. This supports multiple complete suggestions plus independent layer controls.
- Cooper Hewitt's _How Posters Work_ frames poster design as a set of compositional, perceptual, and storytelling moves. Its examples include focusing or overwhelming the eye, using type as image, simplifying, telling a story, amplifying, manipulating scale, activating diagonals, and making a system. That range supports multiple valid answers to a brief rather than one universal "best" style. [Exhibition overview](https://www.si.edu/exhibitions/how-posters-work%3Aevent-exhib-5759)
- Cooper Hewitt's accompanying overview describes concrete effects: simplify imagery to direct attention; use story to provoke a question; amplify with image or language to convey urgency; manipulate scale for depth or tension; use diagonals for energy; and establish a system to balance consistency and variation. Recommendations can explain these effects in plain language and connect them to a user's communication goal. [Exhibition release](https://www.si.edu/newsdesk/releases/cooper-hewitt-present-special-exhibition-how-posters-work)
- The active project already models direction in three independent layers—design (layout, hierarchy, typography), art (how imagery is drawn), and technique (print finish)—and carries a short rationale in each preset. Existing presets span tasks such as gallery openings, music events, coffee, educational posters, book covers, races, invitations, and zines. This structure can support composable recommendations instead of one monolithic style taxonomy. [Style catalog](../../src/lib/prompt-studio/domain/styles.ts) · [Presets and mixes](../../src/lib/prompt-studio/domain/presets.ts)
- The guide's catalog names and categories derive from John Hartnup's "Poster Prompts", while its descriptions are original. Keep source names and original descriptions distinct in catalog provenance. [Original catalog](https://john.hartnup.uk/poster-prompts); [extracted guide](../guia-de-estilos-y-generación-de-carteles-beailabs.md); [source PDF](../guia-de-estilos-y-generación-de-carteles-beailabs.pdf)

## 2026 starter sources and limits

The six contemporary starters translate the following sources into combinations of existing catalog layers. They are editorial choices, not new design movements or a ranking of current popularity.

- [Figma's web design trends for 2026](https://www.figma.com/resource-library/web-design-trends/) discusses expressive type, saturated color, collage, retrofuturism, maximalism, and white space. Use its composition guidance; web interaction patterns do not belong in a static image prompt.
- [Adobe Express's design trends for 2026](https://www.adobe.com/express/learn/blog/design-trends-2026) offers a forecast covering sensory materials, organic imperfection, collage, surreal imagery, and local storytelling.
- [Adobe's 2026 Creative Trends Forecast](https://business.adobe.com/resources/creative-trends-report.html) supplies themes of sensory imagery, authentic connection, surreal play, and local culture. Local details must come from the user's brief or concept, rather than generic cultural decoration.
- [Behance's Design Trends 2026](https://www.behance.net/gallery/239027109/Design-Trends-2026) is a practitioner synthesis with examples of raw aesthetics, imperfect lettering, micro-maximalism, and chromatic expression. It is not a measured ranking of design effectiveness.
- [Dribbble's Design Trends gallery](https://dribbble.com/tags/design-trends) is a visual index for comparing typography, grids, color, and optical imagery. Likes, views, and other engagement counts are not research evidence or a basis for popularity claims.

These editorial forecasts and practitioner examples support directions to explore. They do not establish that a starter improves campaign performance or produces better image-model results. The source registry records URLs, source types, and checked dates. [Reference catalog](../../src/lib/prompt-studio/domain/references.ts)

## Shipped starter behavior

The catalog includes Raw human voice, One loud detail, Chromatic pulse, Soft surreal tactility, Local cut-paper story, and Retro-future grid. Each has a principle, tradeoff, and supporting reading. Format-and-goal recommendations can show them alongside existing directions. The explorer's "2026 starters only" filter combines with its other filters. [Direction catalog](../../src/lib/prompt-studio/domain/presets.ts)

Applying a starter changes only layout, imagery, finish, palette, typeface, type weight and italics, and creative-intent selections. It preserves the user's brief, exact poster text, concept, format, aspect ratio, text-rendering mode, exclusions and cliché choice, target model, prompt structure, language, edit instructions, and model-specific settings. The user can undo the action or refine any visual control. The app compiles a prompt to copy into an external image tool; it does not generate an image. [Application contract](../../src/lib/prompt-studio/domain/discovery.ts)

The year, source names, principle, and tradeoff do not enter the compiled prompt. Only the applied recipe values affect it. Existing saved recipes remain compatible because starter metadata belongs to the catalog, not the recipe schema.

## Practical taxonomy for discovery

1. **Start with the job:** project format/type (event poster, cover, product campaign, educational/informational graphic, social asset, invitation, etc.) and communication goal (announce, attract, explain, persuade, celebrate, establish a mood/identity). Keep these as separate facets: a format describes the artifact; a goal describes its intended effect.
2. **Recommend by design problem, not just style label:** connect goal and context to a compositional strategy such as clear hierarchy, a single focal image, story, urgency/amplification, playful tension, or a repeatable visual system. Explain the expected effect and the tradeoff (for example, “a forceful diagonal adds urgency, but gives dense event details less calm reading space”).
3. **Offer directions as grouped options:** present a small set of distinct directions, each with a named design movement or principle plus a preview and reason. Then let users refine or replace design/layout, art/imagery, and technique/finish independently. Preserve cross-layer combinations and deliberate contrasts for exploration.
4. **Make the catalog findable:** combine search with filters for format, goal, visual effect/tone, design layer, art layer, and finish. Group by the task first; provide style and technique facets after users have a brief. Pagination should follow the filtered result set and keep the current filters/query intact when moving pages.
5. **Teach while recommending:** explain one useful concept per suggestion in short, concrete language (“the oversized headline creates the first read; the smaller date stays secondary”). Show alternatives with different effects, not several near-identical names. Keep a clear route to browse all directions and to choose a less expected mix.

## Popularity in a local-first app

A local-only catalog with no accounts or shared usage telemetry cannot substantiate "most popular," "trending," or usage-count claims. Do not imply measured user popularity. Prefer transparent labels such as **Recommended for this goal**, **Curated pick**, **Good starting point**, or **Explore**. If a "Popular" section is needed, define and disclose its evidence (for example, a versioned editorial selection, or an opt-in aggregate based on actual usage) and distinguish that signal from goal-fit recommendations. A static hand-authored ranking should be called curated, not popular.

## Limits and uncertainties

The museum material is a historical exhibition overview, not a controlled usability study or a validated mapping from modern project types to design styles. The recommendations above are design-informed product guidance, not empirical claims that one style will perform better. The extracted guide text supports its three-layer method and prompt advice, but not a measured link between a style and an outcome. Validate direction labels and explanations with users if user research enters scope.
