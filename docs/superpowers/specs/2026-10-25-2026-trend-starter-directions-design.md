# 2026 trend starter directions

## Intent

Extend Visual Prompt Studio with a faster route from a short brief to a useful, teachable prompt. The feature will add six source-grounded 2026 starter directions to the current format-and-goal recommendations. Selecting a starter will apply a coordinated art-direction bundle while preserving the user's subject, wording, format, aspect ratio, and output settings.

The feature should help a user get a current-looking direction quickly, understand the design principle behind it, and retain full control over the existing layout, imagery, finish, palette, typography, and creative-intent layers.

## Why this change

The current direction cards are already matched by project format and communication goal, but applying one changes only the three visual styles and the design style's palette. The catalog does not identify contemporary trend syntheses, explain their tradeoffs, link a direction to supporting reading, or apply typography and creative-intent choices as one safe starter bundle.

Research across Figma's 2026 web-design overview, Adobe's 2026 graphic and creative forecasts, the supplied Behance 2026 project, and the current Dribbble design-trends gallery points to several relevant themes: deliberate human imperfection, expressive type, controlled maximalism, strong white space, sensory or surreal imagery, chromatic systems, and culturally specific details. Web-only interaction trends such as experimental navigation, chatbots, voice interfaces, and progressive lead forms are outside this product's prompt-generation purpose.

## Goals

- Add six useful 2026 starter directions without replacing the historical style catalog.
- Let a user reach a coherent prompt through brief, format, goal, starter, and copy.
- Teach one concrete design principle and one meaningful tradeoff per starter.
- Apply a coordinated visual bundle without overwriting user-authored content or model settings.
- Attach article references to relevant starters so users can learn beyond the short explanation.
- Reuse the current direction recommendation, filtering, and rendering system.
- Keep the feature deterministic, local-first, accessible, and compatible with existing saved recipes.

## Non-goals

- Image generation, trend scoring, telemetry, accounts, or personalized recommendations.
- A separate onboarding wizard, new route, or modal-first workflow.
- Claims that a trend or starter will improve campaign performance.
- Recreating web interaction trends inside a static image prompt.
- Adding a general trend-intensity, raw-versus-polished, or minimal-versus-maximal control.
- Adding new recipe fields or changing the recipe schema version in this pass.
- Replacing the existing layout, imagery, or finish controls.

## Anti-goals

- Do not label a direction popular or trending based on Dribbble likes or other community counts.
- Do not use "2026" as an unexplained style adjective in the compiled prompt.
- Do not overwrite the user's brief, exact wording, concept, format, ratio, target model, prompt shape, language, exclusions, cliché selection, or model-specific settings when applying a starter.
- Do not present culturally specific design as a generic visual costume. The local-story starter must ask the user's own brief and concept to supply the place, material, or community detail.
- Do not add a second card implementation for explorer results.

## Constraints

- Preserve the Astro page and vanilla TypeScript client architecture.
- Keep `RecipeSchema` at version 2 and retain import, export, and local-storage compatibility.
- Follow the existing three-layer model: design controls layout and hierarchy, art controls imagery, and technique controls finish.
- Use the current daisyUI patterns and semantic theme colors.
- Keep source metadata static and reviewable in the repository.
- External learning links open in a new tab with the existing safe-link attributes.
- The existing vector thumbnails remain educational layout studies, not generated result previews.

## Research basis and limits

- Figma, [Top Web design trends for 2026](https://www.figma.com/resource-library/web-design-trends/): expressive type, saturated color, retrofuturism, maximalism, collage, neo-brutalism, and white-space or accessibility considerations.
- Adobe Express, [Design trends for 2026](https://www.adobe.com/express/learn/blog/design-trends-2026): sensory material, playful lettering, surreal imagery, organic imperfection, freeform storytelling, local flavor, collage, and controlled chaos.
- Adobe, [2026 Creative Trends Forecast](https://business.adobe.com/resources/creative-trends-report.html): sensory work, authentic connection, surreal play, and local culture.
- Behance, [Design Trends 2026](https://www.behance.net/gallery/239027109/Design-Trends-2026): practitioner synthesis covering raw aesthetics, imperfect letterforms, micro-maximalism, chromatic expression, humanized design, and white space.
- Dribbble, [Design Trends gallery](https://dribbble.com/tags/design-trends): a visual reference index, not research evidence or a basis for popularity claims.
- Figma, [Typography in design](https://www.figma.com/resource-library/typography-in-design/): hierarchy, alignment, spacing, type selection, and legibility.
- Cooper Hewitt, [How Posters Work](https://www.si.edu/exhibitions/how-posters-work%3Aevent-exhib-5759): focusing attention, storytelling, amplification, scale, diagonals, and systems.

These sources are editorial forecasts and practitioner examples, not controlled evidence that a visual treatment performs better. The product will describe each starter as a current, source-grounded synthesis and will explain the visual effect rather than promise an outcome.

## Approaches considered

### Extend the current direction system with starter bundles

Selected. Add contemporary direction metadata and an allow-listed application bundle to the existing format-and-goal recommendation system. This preserves the product's current mental model, requires no new route, and lets users continue refining every layer.

### Add a separate guided wizard

A wizard could make first use more linear, but it would repeat the brief, format, goal, and direction controls already present. It would also create two ways to maintain the same recipe and complicate keyboard and responsive behavior.

### Add trend parameter sliders

Controls such as raw versus polished or minimal versus maximal would create more combinations, but they would make the form busier and require new compiler semantics. Named, explained starter directions give users distinct choices with less interpretation.

## The six starter directions

All six use existing style identifiers. They are contemporary combinations of catalog layers, not new movements.

### Raw human voice

- Formats: poster, flyer, social post, editorial illustration.
- Goals: tell a story, make a bold statement, focus attention.
- Layers: Contemporary Editorial, Dada Collage, Halftone newsprint.
- Creative intent: purposeful variation and material honesty.
- Principle: visible construction and controlled irregularity can make a message feel authored rather than automated.
- Tradeoff: rough layering competes with dense supporting copy, so the headline and one image should carry the first read.
- Primary sources: Adobe Express 2026 trends and Behance Design Trends 2026.

### One loud detail

- Formats: poster, social post, story or reel cover, album cover.
- Goals: focus attention, make a bold statement.
- Layers: Japanese Minimal, Pop Art, Mono plus one accent.
- Creative intent: confident restraint.
- Principle: generous empty space makes one exaggerated element more noticeable.
- Tradeoff: it works poorly when many messages need equal emphasis.
- Primary sources: Behance's neo-minimalism and micro-maximalism section, plus Figma's maximalism and white-space guidance.

### Chromatic pulse

- Formats: poster, social post, story or reel cover, event banner, album cover.
- Goals: make a bold statement, set a mood, focus attention.
- Layers: Memphis, Op Art, Screen print.
- Creative intent: concept first.
- Principle: repeated geometry and deliberate color contrast create rhythm without adding literal action imagery.
- Tradeoff: vibrating color and optical pattern can reduce text legibility, so text must remain limited and strongly separated.
- Primary sources: Figma's vibrant-color guidance and Behance's chromatic-expression section.

### Soft surreal tactility

- Formats: poster, book cover, album cover, editorial illustration, social post.
- Goals: tell a story, set a mood, focus attention.
- Layers: Polish Poster School, Surrealism, Letterpress.
- Creative intent: concept first and material honesty.
- Principle: a single impossible metaphor feels more convincing when paper, ink, and scale behave consistently.
- Tradeoff: the metaphor needs a direct connection to the subject or it becomes decorative ambiguity.
- Primary sources: Adobe's Surreal Silliness and All the Feels themes.

### Local cut-paper story

- Formats: poster, editorial illustration, social post, flyer, book cover.
- Goals: tell a story, set a mood.
- Layers: Contemporary Editorial, Matisse Cut Paper, Risograph.
- Creative intent: material honesty and purposeful variation.
- Principle: a place-specific object, pattern, or material gives a story more meaning than generic cultural decoration.
- Tradeoff: the starter cannot invent local cues. The user's brief or concept must name them.
- Primary sources: Adobe's Local Flavor theme and its 2026 graphic-design article.

### Retro-future grid

- Formats: poster, album cover, social post, event banner.
- Goals: focus attention, make a bold statement, set a mood.
- Layers: Swiss International, Op Art, Clean digital.
- Creative intent: concept first and confident restraint.
- Principle: a strict typographic grid gives experimental optical imagery a stable reading order.
- Tradeoff: the clean system can feel generic unless the central image or headline contains a specific idea.
- Primary sources: Figma's retrofuturism guidance and current Dribbble references used only as visual examples.

## Data design

Extend `Direction` with optional educational and application metadata rather than changing `Recipe`:

- `trendYear?: 2026`
- `principle?: string`
- `tradeoff?: string`
- `sourceIds?: readonly string[]`

The existing `patch` already supports recipe fields beyond `styles`. The new starters will use an allow-listed subset:

- `styles`
- `palette`
- `font`
- `fontWeight`
- `fontItalic`
- `signatures`

No trend label, article name, principle, or tradeoff enters the compiled prompt. Only the recipe values applied by the starter affect compilation.

Add the relevant article records to the existing reference catalog with stable IDs, source type, short `bestFor` text, status, and checked date. `sourceIds` must resolve to those records. This avoids duplicating URLs and source descriptions inside presets.

Add an optional `trendYear` filter to `DirectionFilters`. It combines with query, format, goal, style, grouping, and curated-only filters. The explorer UI will expose it as a checkbox labeled "2026 starters only." It is an editorial catalog filter, not a popularity signal.

## Safe starter application contract

Selecting "Use this starter" applies only the allow-listed bundle above. It must preserve:

- idea
- purpose
- aspect and custom aspects
- headline and supporting text
- text-rendering mode
- user's concept detail
- exclusions and cliché selection
- target model and prompt pattern
- language
- edit fields
- Midjourney style references and parameters

The action remains undoable through the existing announcement mechanism. The announcement will state that the visual bundle changed and the user's content and output settings were preserved.

Legacy directions that specify only styles continue to apply styles and the derived design palette as they do today. A starter-supplied palette takes precedence over the design style's default palette.

## User experience

1. The user writes or edits the one-sentence brief.
2. The user chooses a format and communication goal.
3. The recommendation area shows four matched directions. Contemporary starters can appear alongside existing directions when their format and goal match.
4. A 2026 starter card shows its badge, three layers, short rationale, principle, tradeoff, and one compact learning link.
5. The user chooses "Use this starter." The proof and prompt update immediately while their content and output settings remain unchanged.
6. The user can copy the prompt immediately or refine the existing visual-language and fine-tune controls.
7. "Explore all directions" can filter to 2026 starters and combines that choice with every existing filter.

The quick path is therefore brief, format, goal, starter, and copy. No step blocks access to the full composer.

## Card and component design

The current suggested-direction and explorer-result markup duplicates much of the same information. Extract a shared client-side direction-card renderer into a small UI module. It will support full and compact variants while sharing:

- title and badges
- layer labels
- rationale
- educational metadata
- starter action state
- external source links

Keep static field shells in the existing Astro component and reuse `StudioField`, `FieldInfo`, and `StudioDisclosure`. Continue using the project's daisyUI card, badge, button, checkbox, and link conventions with semantic theme colors. Do not introduce a React island for this feature.

The full suggested card shows principle and tradeoff directly. The compact explorer variant shows the same information in a short disclosure or summary to avoid turning the result list into long article cards. Both variants call the same starter-application handler.

## Reference and learning behavior

- Each starter displays one primary "Learn the principle" link chosen from `sourceIds`.
- Additional sources remain available in the existing inspiration section.
- The learning link names the source, not a vague "read more."
- Article links never imply endorsement or measured effectiveness.
- Dribbble remains a community reference source and is not described as research.
- Checked dates and active status use the existing reference-card behavior.

## Accessibility and responsive behavior

- Keep the direction list as a labeled list of articles.
- The starter action retains an accurate `aria-pressed` state.
- The 2026 badge is supplemental text, not the only signal used by the filter.
- Principle and tradeoff text remain real text and do not appear only in a tooltip.
- External source links have descriptive accessible names.
- After a card rerender, keyboard focus returns to the activated starter, matching current behavior.
- Removing the 2026 filter returns focus to that filter.
- At narrow widths, educational copy stays below the thumbnail and before the action. The action remains full-width if that matches the current card breakpoint.
- No interaction requires hover.

## Compatibility

Existing stored and exported recipes remain valid because the recipe schema does not change. Trend metadata belongs to the catalog, not persisted recipe state. On reload, the applied recipe values remain, but the UI does not need to reconstruct which starter originally supplied them.

`view.presetId` remains transient. If a user modifies a layer after applying a starter, the card can remain the last applied starter as it does today; this pass will not attempt full bundle-equivalence detection.

## Verification

Extend the current discovery tests to cover:

- all six starters use valid style, format, goal, signature, and source IDs
- every `sourceId` resolves to one reference record
- the 2026 filter combines with query, format, goal, style, and curated-only filters
- recommendations remain deterministic and free of duplicates
- safe starter application changes every supplied allow-listed field
- safe starter application preserves every protected field
- legacy directions retain current behavior
- a supplied starter palette overrides the design default

Run the repository's type checks, lint, discovery tests, and production build. Verify the home page with the configured Playwright CLI at desktop and mobile widths. Check keyboard selection, filter removal, focus restoration, card wrapping, external-link names, and the browser console.

## Builder calls

- Exact three-color palettes and type settings for the six starters are builder calls, but they must use existing palette and font values and follow each starter's written principle.
- Recommendation ordering is a builder call. At least two 2026 starters should be eligible for common poster and social combinations, without forcing every set of four to contain one.
- The compact explorer disclosure pattern is a builder call after comparing the existing daisyUI collapse and card guidance.
- Copy may be tightened for card fit without changing the stated principle or tradeoff.
- No new illustration assets are required. Existing vector proof thumbnails should render every new combination.
