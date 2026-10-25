# Adding a target

A target is an image model or tool whose syntax shapes the compiled prompt. Gemini was added in commit `02d88ce`; use it as a worked example.

## Steps

1. **Register the target** in `TARGETS` in `src/lib/prompt-studio/domain/recipe.ts`. Give it an `id`, a `label`, a `model` name and a short `note` that tells the user what is different about it. `TargetId` and the schema's allowed values are derived from this list.
2. **Choose its prompt shapes** in `PATTERNS_BY_TARGET` in the same file, so the target only offers shapes that suit it.
3. **Teach the compiler** in `src/lib/prompt-studio/domain/compiler.ts` if the target needs special output: parameters, a negative prompt, or exclusions rewritten as positive wording.
4. **Add a logo path** in `src/lib/prompt-studio/ui/target-logos.ts`. Use a monochrome 24x24 path. If you have no mark, the generic glyph is the fallback.
5. **Add a reference** in `src/lib/prompt-studio/domain/references.ts` linking to the model's prompting documentation.
6. **Update the copy**: the "Send to" text in `src/layouts/components/PromptStudio.astro`, the target table and intro in `src/pages/guide.astro`, the README table, and [features](features.md).
7. **Test it** in `scripts/test-prompt-discovery.mjs`: the target compiles, and any target-specific behavior holds.

## Check

```sh
pnpm test:discovery
pnpm check
```

Then open the Studio, pick the target, and confirm the prompt, notices and copy buttons.
