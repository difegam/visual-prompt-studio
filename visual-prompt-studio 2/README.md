# Visual Prompt Studio

A local-first, copy-first composer for image prompts with real art direction. You pick a
layout movement, an imagery movement and a print finish as three separate layers, see a
vector proof of the combination, and copy a prompt translated for the model you use.

No account, no API key, no image generation, no network requests from the app.

## Run

Requires Node.js 22.12+.

```bash
npm install
npm run dev            # http://localhost:5173
npm run check          # strict typecheck + tests
npm run build          # static site in dist/ (any static host)
npm run build:single   # one self-contained HTML in dist-single/ (fonts inlined)
```

## What changed from v0.1

| Area            | v0.1                                 | v0.2                                                                                                                  |
| --------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Language        | Untyped ES modules                   | TypeScript 7, `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`                                    |
| Contracts       | Implicit objects                     | One Zod 4 `RecipeSchema` drives state, import, export and storage                                                     |
| Catalog ids     | Strings                              | Literal unions derived from `as const satisfies` catalogs; an unknown style is a compile error                        |
| Build           | None, fonts copied by a script       | Vite 8; Fontsource CSS imports, latin subsets only                                                                    |
| Targets         | GPT Image, Midjourney, SDXL, generic | + FLUX.2 (no negative prompts: exclusions become positive phrasing)                                                   |
| Patterns        | 4                                    | 5: art direction, seven-line (EN/ES), production spec, restyle in same chat, edit with reference                      |
| Exclusions      | 14, free text                        | 19, each with natural-language, Spanish, `--no` token and positive forms; skipped when a chosen style depends on them |
| Subject clichés | —                                    | 8 packs (exhibition, book event, festival, race, summer, concert, café)                                               |
| Preview         | One SVG per style                    | Layer compositor: layout × imagery × finish rendered together, CMYK-coded                                             |
| Prompt view     | Plain text                           | Segments tagged by source; hover a layer to see which words it produced                                               |
| Midjourney      | `--ar`, `--no`                       | + `--sref` codes (validated), `--raw`, `--s`                                                                          |
| Inspiration     | —                                    | 11 verified sources with status, cost and context-aware deep links                                                    |

## Architecture

```
src/domain/          pure, framework-free, fully tested
  styles.ts          3-layer style catalog with traits (ownLettering, ownTexture, misregistered, fixedPalette)
  avoids.ts          exclusions + subject cliché packs
  fonts.ts           specimen fonts and how each is described to a model
  recipe.ts          option catalogs + Zod RecipeSchema (single source of truth)
  compiler.ts        Recipe → CompiledPrompt: segments, negative prompt, notices, skipped exclusions
  presets.ts         quick starts and clashing mixes
  palettes.ts        palette variations, color naming, luminance
  references.ts      external sources with verification date and status
src/ui/
  sketch.ts          SVG layer compositor (layout, motif, finish)
  app.ts             typed store, rendering, persistence, import/export
tests/               Vitest: compiler per target, traits, schema round trip
```

Design rules the compiler enforces:

1. **One decision per place.** Context is resolved once (palette, typography, exclusions), then formatted per target.
2. **Styles own their side effects.** Risograph needs grain and misregistration, so "All grain" is skipped and shown as skipped. Art Nouveau and Psychedelia carry their own lettering, so a chosen font is not sent. Cyanotype and Mono + accent dictate the palette.
3. **Targets disagree on negatives.** GPT Image and generic get "Avoid: …"; Midjourney gets concrete `--no` nouns (its moderation reads each word); SDXL gets a separate negative prompt; FLUX.2 gets only positive phrasing because it has no negative prompts.
4. **Exact text, and no other text.** Every natural-language pattern quotes each line and forbids anything else (beailabs guide, section 6).
5. **Deterministic.** Same recipe, same prompt. Randomness exists only in the UI shuffle.

## Verified facts this build relies on (checked 24 Oct 2026)

- ChatGPT image generation runs on GPT Image 2 ("ChatGPT Images 2.0", April 2026); DALL·E 2 and 3 were retired on 12 May 2026. The supplied masterclass still refers to DALL·E 3, so its advice about prompt rewriting is dated.
- Midjourney's default is V8.2 (July 2026). `--sref`, `--raw`, `--s` and `--no` are current; the official `--no` page warns that moderation reads each word separately.
- FLUX.2 does not support negative prompts; BFL recommends describing the desired result instead.
- SDXL works best at its trained resolution buckets; the compiler recommends the closest one.

## Known limitations

- It composes prompts; it does not generate images or measure whether a prompt works.
- Style names are educational approximations, not an art-history ontology.
- Previews are original vector studies. They show vocabulary, not model output.
- Prompting a font describes a type class. For exact brand type, composite text after generation.
- Spanish output covers the seven-line and restyle patterns; other patterns are English.
- Zod is the largest dependency (~55 kB gzip of the bundle). If size matters, `zod/mini` is a drop-in for this schema.

## Roadmap

**P0, before adding anything:** run the evaluation below. If directed prompts don't beat the baseline, stop expanding the catalog.

**P1**

- Save named recipes locally (IndexedDB) and compare two side by side.
- "Swap only the Style line" batch export: one prompt per style for the same brief, as the guide recommends.
- Grow the catalog toward the guide's 100 styles only for styles that pass evaluation.

**P2**

- Optional BYOK generation by exporting the recipe to pixgen (or calling provider SDKs), storing image, model, seed and prompt together for evaluation.
- Image-to-recipe (describe an image, map it onto the three layers).

## Evaluation

Choose 12 briefs across posters, editorial and covers. For each, generate the undirected baseline, the art-direction prompt and the seven-line prompt with the same model and settings (3 seeds each). Blind-review for: distinctiveness, adherence to purpose and hierarchy, exact copy, unwanted clichés, and edits needed to reach a usable result. Expand only what wins.

## Sources

- beailabs, _Deja de hacer imágenes genéricas con ChatGPT_ (Sept 2026): seven-line pattern, three-layer model, anti-AI-look exclusions, cliché tables.
- [John Hartnup, Poster Prompts](https://john.hartnup.uk/poster-prompts): 100-style catalog the guide is based on. No license stated; referenced, not copied.
- [OpenAI image prompting guide](https://developers.openai.com/api/docs/guides/image-prompting)
- [Midjourney `--no`](https://docs.midjourney.com/docs/no)
- [BFL: FLUX.2 and negative prompting](https://help.bfl.ai/articles/7734566352-does-flux-2-support-negative-prompting)
- Fonts: Inter, Oswald, Josefin Sans, Archivo Black, Bebas Neue, Limelight, Fraunces, Cormorant Garamond, Shippori Mincho, IBM Plex Mono, Bricolage Grotesque, all OFL-1.1 via [Fontsource](https://fontsource.org). Keep the package license notices when redistributing a build.
