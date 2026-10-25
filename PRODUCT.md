# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Poster makers who use AI image models (such as ChatGPT image generation) to produce posters, flyers, book and album covers, and social posts. They know what they want the piece to look like but need to turn that intent into a prompt the model follows. They work at a desktop browser, composing a recipe, copying the prompt, and pasting it into their image tool.

## Product Purpose

Visual Prompt Studio is a local-first, copy-first composer for art-directed image prompts. It combines layout, imagery, print finish, palette, typography, exact poster text, and exclusions into a prompt tuned to the selected image model. It does not generate images. Success is a prompt the user can copy and paste, and get a result that matches their art direction.

## Positioning

- **Layered art direction.** Layout (design), imagery (art), and print finish (technique) are chosen independently, so a user combines them instead of picking one flat style name.
- **Model-aware output.** The prompt structure changes with the target image model (five targets), instead of one generic prompt for all.
- **Source-grounded starters.** Six contemporary 2026 directions combine existing visual layers with a palette, typography, and creative intent. Each explains a design principle and tradeoff and links to supporting reading.

## Operating Context

- The user composes a recipe on the single-page homepage, copies the compiled prompt, and uses it in an external image tool.
- Recipes persist in browser storage and can be exported and imported as validated JSON.
- Inspiration links open external sites.

## Capabilities and Constraints

- Nine aspect ratios, eight formats, five model targets, and target-appropriate prompt structures.
- Independent layout, imagery, and finish styles; palettes; type specimens; optional authorial intent.
- Format-and-goal recommendations include contemporary starters alongside existing directions. The explorer's "2026 starters only" filter combines with its other filters.
- Applying a starter changes only layout, imagery, finish, palette, typeface, type weight and italics, and creative-intent selections. It preserves the user's brief, exact poster text, concept, format, aspect ratio, text-rendering mode, exclusions, and output settings, including target model, prompt structure, language, and model-specific parameters. The action can be undone, and each visual control remains editable.
- Exact poster copy preserved, or a clean area reserved for later typesetting.
- Selectable exclusions; style-dependent exclusions are called out and skipped automatically.
- The app makes no API calls and sends no recipe data to a server.
- Built on the Astro template (Astro 7, React 19, Tailwind CSS 4, daisyUI 5, strict TypeScript). Astro owns routing, layouts, and metadata; the composer is a typed browser-side module. This stack stays.
- Style names and the three-layer split follow the beailabs guide (Spanish source, in `visual-prompt-studio 2/`); some catalog entries carry Spanish terms. Whether Spanish is a supported UI language is undecided.

## Brand Commitments

Name: Visual Prompt Studio. No other brand commitments confirmed.

## Evidence on Hand

- Source guide and original v2 reference in `visual-prompt-studio 2/`, including the beailabs style guide PDF.
- Original editorial illustrations for the homepage and sample articles (see `docs/visual-assets.md`).
- The 2026 starter directions draw on editorial forecasts and practitioner examples, not controlled evidence of effectiveness or measured popularity. Sources and limits are recorded in [Visual prompt recommendation principles](docs/research/visual-prompt-recommendation-principles.md).
- No testimonials, customer counts, or usage data exist. Do not invent them.

## Product Principles

1. The compiled prompt is the product; every control exists to improve what the user copies.
2. Art direction is layered and independent, never collapsed into a single style pick.
3. Prompts adapt to the target model.
4. Stay local-first and copy-first: no accounts, no server, no generation.
5. Preserve the user's exact words when they ask for exact poster text.

## Accessibility & Inclusion

No specific standard was set. Keyboard and screen-reader use is already a stated concern in recent work (accessibility commit), so treat it as a baseline rather than an afterthought.
