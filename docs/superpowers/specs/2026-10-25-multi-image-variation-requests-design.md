# Multi-image variation requests

## Intent

Help a poster maker ask ChatGPT Images or Gemini for a small set of meaningfully different compositions without leaving Visual Prompt Studio's current copy-first workflow. The user still composes one recipe, reviews one compiled prompt, and copies it into an external image tool. The prompt asks for several separate images while keeping the chosen art direction and production constraints fixed.

This feature responds to current web-chat behavior rather than promising an API-style batch. ChatGPT may create the requested images sequentially, and either provider may return fewer images because of product limits. Visual Prompt Studio describes the count as a request and never presents it as guaranteed output.

## Goals

- Let the user request one, two, three, or four images from one prompt.
- Keep one image as the default and preserve the existing workflow for current users.
- When several images are requested, ask for meaningfully different compositions rather than near-duplicates.
- Keep the selected layout, imagery, finish, palette, typography, exact poster text, format, aspect ratio, and exclusions unchanged across the alternatives.
- Ask for separate images rather than a contact sheet or comparison grid.
- Support ChatGPT Images and Gemini first, with target capability metadata that can support other targets later.
- Preserve old saved and exported version 2 recipes that do not contain the new setting.

## Non-goals

- Do not generate images, call provider APIs, upload references, inspect results, or guarantee an output count.
- Do not compile several prompts or add prompt tabs and per-variant copy actions.
- Do not vary the selected direction, palette, typography, exact text, or exclusions automatically.
- Do not let the user choose which attributes may vary in the first release.
- Do not add the control for Midjourney, FLUX, Stable Diffusion, or Other model until their intended tool and prompt behavior have been researched.
- Do not add dependencies, accounts, remote state, or a new route.

## Approaches considered

### Append a target-aware variation instruction

Selected. Add one recipe field and one compact output control. The existing compiler appends a short instruction for supported targets when the requested count is greater than one. This keeps one recipe, one compiled prompt, and one copy action. It also isolates provider differences in the compiler and target catalog rather than the UI.

### Add a variation-specific prompt shape

This would keep the existing prompt shapes unchanged, but it would make the user choose between concepts that are independent. A seven-line brief can also request four images. Adding parallel variation versions of the prompt shapes would duplicate compiler behavior and make future changes harder.

### Compile one prompt per variation

Separate prompts could prescribe a distinct composition for every result. They would also require prompt tabs, multiple copy actions, rules for inventing each composition, and more persisted state. That changes the product from an art-direction composer into a variation planner and is outside this feature's intent.

## Experience

For ChatGPT Images and Gemini, show a compact select labelled `Images requested` in the output controls near `Send to` and `Prompt shape`. Its options are `1`, `2`, `3`, and `4`, with `1` selected by default.

When the user selects two through four, show this short supporting note below or beside the control:

`Best effort. The image tool may return fewer images or create them one at a time.`

The control uses the existing `StudioField`, select, focus, spacing, and narrow-screen patterns. It must not introduce a new panel or required step. At narrow widths it stacks with the existing output controls without horizontal scrolling.

For targets without declared support, hide the control. Preserve the stored count while the user changes targets so switching back to ChatGPT Images or Gemini restores their choice. Unsupported targets compile exactly as they do now and do not receive a variation instruction. The target note remains the place for model-specific guidance; do not add a warning notice merely because a hidden count is greater than one.

Use `Images requested`, not `Number of outputs`, because the app addresses people working in web chat rather than API terminology. Use `request` and `best effort` in explanatory copy. Do not say that the provider will generate the exact count simultaneously.

## Variation semantics

When the count is greater than one, every requested image must preserve:

- the subject and concept in the brief;
- the selected project format and aspect ratio;
- layout, imagery, and finish styles;
- palette and typography;
- exact rendered text or the instruction to leave text-free space;
- authorial intent and exclusions;
- edit constraints when the `Edit with reference` prompt shape is active.

The alternatives vary only the composition and placement of the main visual idea. The instruction asks for a meaningful difference in framing, scale, spatial arrangement, or focal placement. It must not invite random style, color, lettering, or subject changes.

Each result should be a separate image. The instruction explicitly rejects a contact sheet, tiled grid, split frame, or single image containing several options.

## Recipe and target model

Keep `RecipeSchema` at version 2. Add:

```ts
imageCount: z.number().int().min(1).max(4).default(1);
```

`DEFAULT_RECIPE.imageCount` is `1`. Zod's default makes saved and imported version 2 recipes without the field valid and returns a complete `Recipe`. Exported recipes include the resolved field. Direction and starter application must preserve it with the other output settings.

Give each target an explicit variation capability. The exact type name is a builder call, but its meaning is:

```ts
variationRequest: { maxRecommended: 4 } | null
```

ChatGPT Images and Gemini declare support with a recommended maximum of four. The remaining targets declare no support. The UI derives visibility and options from this metadata. It must not check target IDs to decide whether to show the control.

The recipe schema owns the absolute allowed range of one through four. Target metadata owns whether the prompt-based feature is available and may later set a lower recommended maximum.

## Compiler behavior

Add one focused helper that returns either no segments or a target-aware variation instruction. Call it after the existing prompt pattern has compiled so the main pattern functions remain unchanged. Tag the added segment with a new source such as `variation` so the prompt proof can identify where those words came from if the segment is later exposed in the separation legend.

For `imageCount === 1`, or when the selected target has no variation capability, add nothing. The compiled prompt must remain byte-for-byte unchanged for existing default recipes.

For ChatGPT Images and Gemini, the English instruction should carry this meaning:

> Create [count] distinct alternatives as separate images. Keep the subject, exact text, format, aspect ratio, palette, typography, and overall art direction unchanged. Vary the composition and placement of the main visual idea meaningfully between alternatives. Do not combine the alternatives into a contact sheet, grid, split frame, or single image.

The builder may adjust punctuation and repeated nouns so the instruction reads naturally after each prompt shape. The constraints and meaning above are required.

The current compiler supports Spanish only for the seven-line and restyle shapes. For those Spanish outputs, add a Spanish variation instruction with the same constraints. Other prompt shapes keep their existing English behavior. Do not introduce a new translation system as part of this feature.

`Edit with reference` still means one attached source image with one protected edit brief. Multiple requested results are separate interpretations of that same edit. `Restyle in same chat` still forces a clean restart from the written brief; the variation instruction applies to the newly requested alternatives.

Do not modify the negative prompt. Do not add a compiler notice for supported counts because the persistent best-effort note already explains provider behavior.

## UI behavior and persistence

Bind the new select through the existing store and `patch` flow. Rendering reads the active target's capability, hides or shows the field, limits the visible options to that capability, and synchronizes the stored count.

Changing the count recompiles the prompt immediately and persists with the same debounce as the rest of the recipe. Import, export, reset, and local storage use the existing validated recipe path. Reset returns the count to one.

The control needs an information popover that says what remains fixed and what changes. Suggested copy:

`Request several separate images with the same art direction. Only the composition and placement of the main idea should change.`

The compiled prompt remains a single proof. The copy buttons and keyboard shortcut copy the whole prompt once. Character count, target switching, mobile proof behavior, and negative-prompt copying continue to work without special cases.

## Compatibility and failure behavior

- Missing `imageCount` resolves to `1`, so current saved and exported recipes continue to load.
- Invalid imported values outside one through four fail through the existing recipe validation and import error flow.
- Switching from a supported target to an unsupported target preserves the stored count but omits its instruction.
- Switching back restores the selection and instruction.
- Clipboard failure continues to select the single compiled prompt for manual copying.
- Provider refusal, partial generation, sequential generation, and rate limits happen outside the app. The UI explains best-effort behavior but does not attempt to detect or recover from it.

## Documentation

Update the product and feature documentation to say that ChatGPT Images and Gemini prompts can request up to four separate composition variants on a best-effort basis. Keep the local-first and no-generation statements unchanged. The guide should explain that the providers may return fewer images or generate them sequentially.

Do not state that four is a provider maximum. It is the studio's recommended first-release limit for a dependable and readable request.

## Verification

Add domain tests that prove:

- parsing a version 2 recipe without `imageCount` yields `1`;
- one image leaves existing compiled prompts unchanged;
- counts two through four add the required instruction for ChatGPT Images and Gemini;
- the instruction requests separate images, meaningful composition changes, and fixed art-direction constraints;
- unsupported targets omit the instruction even when the stored count is greater than one;
- the Spanish seven-line and restyle outputs receive equivalent Spanish instructions;
- invalid counts fail schema validation;
- applying a direction preserves `imageCount`.

Run the existing checks and build. In a real browser, verify the homepage with Playwright CLI:

- the field is visible for ChatGPT Images and Gemini and hidden for the other targets;
- selecting each count updates the prompt and survives a supported-to-unsupported-to-supported target round trip;
- reset returns the count to one;
- keyboard and screen-reader labels are clear;
- the output controls do not overflow at 390 by 844 pixels;
- the browser console has no errors.

Use the Chrome DevTools MCP for the required accessibility audit after the UI change.

## Constraints and builder calls

- Preserve Astro, vanilla TypeScript, Zod, daisyUI, and the existing compiler architecture.
- Add no dependency. Native select, schema defaults, and existing store behavior cover the feature.
- Read the current Astro documentation and the project's Astro template guidance before changing Astro markup or studio styles.
- Preserve the uncommitted blank-first-run change currently present in `src/lib/prompt-studio/ui/app.ts`.
- The builder chooses the internal capability type name, helper name, and exact responsive CSS placement while preserving the behavior and copy hierarchy in this document.
- If provider research later supports another target, add its capability and target-specific compiler wording. Do not widen support by assuming all tools interpret multi-image requests the same way.

## Success criteria

- A first-time or existing user sees no workflow change while the count remains one.
- A user targeting ChatGPT Images or Gemini can request up to four separate composition alternatives with one copied prompt.
- The compiled instruction holds the selected art direction fixed and asks only for meaningful composition differences.
- The interface states that the requested count is best effort.
- Existing version 2 recipes, unsupported targets, direction application, imports, exports, and default compiled output remain compatible.
