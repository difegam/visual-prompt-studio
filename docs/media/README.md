# README media

The README shows these files. All are real captures of the Studio at a 1440 px wide window in the light theme, using one example brief: a poster for a late-night jazz series called "NIGHT TIDES". Keep GIFs under 8 MB.

| File                             | What it shows                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `demo.gif`                       | The 30 s promo film cut for the README: the brief is typed, directed layer by layer, resized, recoloured, compiled and copied. |
| `visual-prompt-studio-promo.mp4` | The full 30 s promo film in high quality (1920×1080, 30 fps).                                                                  |
| `directions.png`                 | The direction explorer filtered to posters and 2026 starters, with the active filter pills and proof sheet.                    |
| `layers.gif`                     | Picking a style on the Layout, Imagery and Finish tabs; the proof sheet redraws after each pick.                               |
| `font-picker.png`                | The font picker dialog on the Display category with the live "NIGHT TIDES" specimen.                                           |
| `targets.gif`                    | Switching the target model; the compiled prompt, its length and the negative prompt change with it.                            |

`demo.gif` is cut from the promo's render (`ffmpeg`, 960 px, 12 fps). The MP4 is the full-quality render from HyperFrames. The other files come from a Playwright script that drives `pnpm dev` and holds each state for 0.7–2 s; the cursor in the GIFs is drawn in, because headless screenshots do not show one.
