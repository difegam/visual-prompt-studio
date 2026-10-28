# Features

A reference for what the Studio does. The in-app guide at `/guide` covers the same ground for end users.

## Guided path

The Studio opens as a four-step path: **Describe, Look, Refine, Send**. A step bar shows one step's controls at a time, with Back and Next, and a one-line summary of your current choice for each step. Steps are never locked, so you can open any of them, and the prompt panel stays visible throughout.

- **Main road.** Describe: idea, format, goal, headline. Look: pick a direction. Refine: palette. Send: target model, then Copy prompt.
- **Detours** return to the same step: "Try an example", the direction explorer and compare, "Build the look layer by layer", and "Start from an existing image" (Edit with reference).
- **Advanced options** stay collapsed in their step: text and size, typography, exclusions, authorial intent, prompt shape, language and model settings.
- The **Show all options** switch turns the step bar off and shows every control on one page. The choice is remembered in the browser. The step itself is not stored.
- Changing step slides an indicator along the step bar and brings the new panel in from the direction you are moving. Motion only plays after you change step, never while you type, and it is off when the system asks for reduced motion.
- Changing step moves focus to the step heading and announces "Step N of 4" to screen readers.
- A step with no input still gives a usable prompt: the starting look (Swiss layout, Surrealism imagery, Risograph finish) applies until you choose a direction.

## Brief

- **What are you making?** Free text.
- **Try an example.** One pill per format loads a sample brief (format, aspect, idea, headline, text and detail) so you can test the tool quickly. Your look, target and pattern stay as they are, and Undo restores the previous brief.
- **Format.** Poster, Flyer, Book cover, Album cover, Social post, Story / Reel cover, Editorial illustration, Event banner. Each suggests an aspect ratio.
- **Goal.** What the piece must communicate. Format and goal drive the recommendations.
- **Aspect ratio.** Nine presets plus a custom-ratio dialog.
- **Concept.** One visual idea.

## Directions

- **Recommended directions** match the chosen format and goal.
- **Explorer** searches and filters all 16 directions, with grouping, curated-only and "2026 starters only" filters, removable filter pills with a clear-all control, and pagination that keeps the current filters.
- **2026 starters:** Raw human voice, One loud detail, Chromatic pulse, Soft surreal tactility, Local cut-paper story, Retro-future grid. Each shows a principle, a tradeoff and supporting reading.
- **Compare directions** puts any two directions (suggested or from the explorer) side by side: layout, imagery, finish, palette, type, principle, tradeoff and a practical tip. Selection is session-only and nothing is applied until you choose a direction. Applying keeps Undo.
- **Readability advice** is optional and appears only when the recipe carries a known legibility risk, with an action to review the text.
- **Starter editions** come from a catalog (`trends.ts`), so the badge, filter label and status follow the current edition.
- **Applying a direction** changes only layout, imagery, finish, palette, typeface, type weight and italics, and creative intent. It keeps your brief, exact text, concept, format, aspect ratio, text mode, exclusions and output settings, and it can be undone. Every control stays editable afterwards.

## Style layers

A 29-entry catalog split into three layers, chosen independently:

- **Layout** (design movements): grid, hierarchy, where the type sits.
- **Imagery** (art movements): how the picture is drawn.
- **Finish** (technique): print and material treatment.

A vector proof sheet previews the combination. It is not a generated image.

## Fine-tune

- **Palettes.** Six, each with variations.
- **Typography.** 14 bundled typefaces. The font picker dialog has search, category filters, a live specimen, and weight and italic toggles.
- **Remove the default look.** 19 exclusions, plus common clichés for a chosen subject category. Exclusions that conflict with the chosen style are flagged and skipped. Defaults can be applied or cleared.
- **Authorial intent.** Concept first, Material honesty, Purposeful variation, Confident restraint.
- **Exact text.** A headline and up to four more lines. "Text in the image" either asks the model to render the exact text or reserves clean space.

## Targets and prompt shapes

Six targets: ChatGPT Images, Gemini, Midjourney, FLUX, Stable Diffusion and Other model. Each offers the shapes that suit it from: Art direction, Seven-line brief, Production spec, Point-of-view brief, Restyle in same chat, Edit with reference (with "Change only" and "Keep exactly" fields).

Target-specific behavior:

- Midjourney adds `--ar`, `--no`, `--sref`, `--raw`, `--s`.
- FLUX has no negative prompt, so exclusions are rewritten as positive wording.
- Stable Diffusion produces a separate negative prompt.

Prompts can be written in English or Spanish. Notices explain target-specific behavior.

## Copying and comparing

Copy prompt, Copy negative (when the target has one), and Compare with an undirected prompt. The copy buttons stay above two tabs: **Proof** (the vector study, layer legend and readability advice) and **Prompt** (the generated prompt, negative prompt, character count and notices).

**Open in** links open ChatGPT, Gemini, Midjourney or FLUX. ChatGPT receives the prompt in the link (when it fits in 2000 characters), so it can appear in browser history. The other targets copy the prompt first, then open the tool.

The `/compare` page shows before/after sliders of a generic prompt against a studio prompt.

## Recipes and privacy

The recipe is saved in `localStorage` (a version-2 schema validated with Zod). JSON import and export use the same schema. Unreadable stored data is backed up under an `.unreadable` key. The app makes no API calls and sends no recipe data to a server.

## Site

User guide, inspiration links (a filterable registry of 19 references, with topic filters and "Start with a principle" paths for design learning), blog with tags, categories and authors, About page, light and dark themes, and search. The build also generates `llms.txt` and `llms-full.txt`.
