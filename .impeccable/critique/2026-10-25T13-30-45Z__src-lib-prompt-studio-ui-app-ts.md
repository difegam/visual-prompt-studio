---
target: Prompt Studio homepage
total_score: 27
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 2
timestamp: 2026-10-25T13-30-45Z
slug: src-lib-prompt-studio-ui-app-ts
---

Method: dual-agent (A: `/root/design_assessment` · B: `/root/evidence_assessment`)

## Design Health Score

| #         | Heuristic                       |     Score | Key issue                                                                          |
| --------- | ------------------------------- | --------: | ---------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     |         2 | Autosave is silent; copy feedback is transient.                                    |
| 2         | Match System / Real World       |         3 | Poster language is grounded; “recipe” and model parameters may be jargon.          |
| 3         | User Control and Freedom        |         3 | Import/reset undo is present; no broad undo/redo.                                  |
| 4         | Consistency and Standards       |         3 | Controls are cohesive, but the long page mixes many interaction types.             |
| 5         | Error Prevention                |         3 | Length limits, inline errors, and model-aware choices help prevent mistakes.       |
| 6         | Recognition Rather Than Recall  |         3 | Labels, contextual info, and preview help; many features require scrolling.        |
| 7         | Flexibility and Efficiency      |         3 | Search, filters, import/export, and a copy shortcut support experienced users.     |
| 8         | Aesthetic and Minimalist Design |         1 | The opening heading appears near-black on the dark canvas; the page is also dense. |
| 9         | Error Recovery                  |         3 | Import errors, clipboard fallback, reset/import undo are handled.                  |
| 10        | Help and Documentation          |         3 | Contextual explanations and sourced learning exist, but not as a clear task path.  |
| **Total** |                                 | **27/40** | **Acceptable, just below Good**                                                    |

## Design Specificity Verdict

The interface feels authored for poster-making: its press-proof vocabulary, separate layout/imagery/finish layers, exact-copy controls, and model-aware prompt output fit the product. But the workflow currently presents as a long control catalog; the studio character is more visible in the components than in the pacing.

The automated detector returned **0 findings** for `PromptStudio.astro` (exit 0, empty JSON). That does not detect the observed heading contrast issue. The separate design review saw the hero heading rendered nearly black against the dark surface; treat this as a high-priority visual defect to verify against the actual theme tokens.

Browser inspection succeeded in a fresh local tab. The critique overlay was not injected: the available browser evaluation is read-only, and the repo `playwright-cli` attempt hit a cache permission error. No user-visible overlay is available.

## Overall Impression

The seed brief and poster proof make the task tangible quickly; the biggest opportunity is to turn the control-heavy page into a paced composition workflow, while keeping the powerful options available.

## What's Working

- The populated example avoids a blank-page start and shows what a useful brief/headline/venue combination looks like.
- The four art-direction layers and proof sketch make abstract choices concrete.
- Field explanations and annotated, qualified references teach without overstating trend claims.

## Priority Issues

- **[P1] Hero heading contrast appears broken in the dark studio.** It undermines the product promise and the page’s main hierarchy. Verify the theme token inheritance and apply a studio-scoped semantic heading color. Suggested command: `$impeccable audit`.
- **[P1] The primary workflow is a long, dense control sequence.** First-timers face numerous decisions before reaching a confident prompt; secondary options compete with composition. Stage the core flow and progressively disclose advanced controls while preserving proof visibility. Suggested command: `$impeccable distill`.
- **[P2] Proof framing may not match the selected aspect ratio.** A poster-shaped sketch alongside a selected 4:5 Feed option can make the preview’s relationship to output unclear. Make the sketch frame track the chosen ratio or label it more explicitly. Suggested command: `$impeccable clarify`.
- **[P2] Autosave has little reassurance.** Users invest in a recipe without a clear “saved in this browser” signal. Surface calm, durable local-save status near the working area. Suggested command: `$impeccable clarify`.
- **[P2] Technical output settings leak into the novice path.** Model-specific parameters need plain-language context and progressive disclosure. Suggested command: `$impeccable onboard`.

## Persona Red Flags

- **Jordan, first-timer:** The visible brief, format, goal, aspect, text mode, concept, and direction choices may feel like a checklist with no obvious “start here.” “Your concept” remains abstract even with helper copy.
- **Alex, power user:** Search/pagination help, but there is no general undo/redo or compact keyboard-first route; the copy shortcut is not discoverable beyond its tooltip.
- **Sam, accessibility-dependent:** Semantic labels and status are present, but the heading’s apparent contrast issue is significant; live prompt updates may not be announced clearly. A dedicated browser accessibility check is still needed.

## Minor Observations

- The proof sketch is accurate about being illustrative, but that caveat is visually quiet.
- Learning explanations are valuable, though their amount may slow selection when the user’s primary intent is to generate a prompt.
- The primary direction cards and explorer use different density levels; keep the relationship clear when revising the picker.

## Questions to Consider

- Should the example poster lead the first screen, or should the product promise remain the first anchor?
- Which decisions must precede the first useful prompt, and which can wait until the user wants more art-direction depth?
- Should the proof read as a trusted preview, or as an illustrative study?

This critique is intended to inform the planned comparison-and-learning features too: those additions should reinforce the paced composition path rather than add another competing layer of controls.
