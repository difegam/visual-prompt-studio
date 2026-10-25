# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- "Try an example" pills under the brief: one per format loads a sample brief and keeps your visual look.
- Compare page (`/compare`) with before and after sliders for a generic prompt against a studio prompt.
- Direction comparison and prompt readability advice in the studio.
- Principle-led design learning: topic filters and "Start with a principle" paths for learning sources.
- "Open in" links for ChatGPT, Gemini, Midjourney and FLUX.
- Copy button animation and feedback.
- Apache-2.0 license with a `NOTICE` that keeps the Astroplate MIT notice.
- README rewrite, a new `docs/` set, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and issue and pull request templates.

### Changed

- Menu reorganized into main pages (Studio, Compare, Guide) and quieter site links (Blog, About), with an active state on the current page. GitHub and the theme switcher align to the right.
- Starter editions generalized; the explorer filter, pill and status now read the current edition from the catalog.
- Applying any direction clears the comparison selection. The shared `esc` helper and `getDirection` replace duplicated code.
- Documentation now lists six model targets, including Gemini.

## [1.0.0]

### Added

- Prompt Studio: nine aspect ratios, eight formats, and layout, imagery and finish layers.
- Palettes, bundled typefaces and a font picker dialog.
- Six 2026 starter directions with apply and undo.
- Six model targets (ChatGPT Images, Gemini, Midjourney, FLUX, Stable Diffusion, other) with target-specific prompt shapes.
- Exact poster text, exclusions, authorial intent, English and Spanish prompts.
- Copy actions, undirected-prompt comparison, and validated JSON import and export.
- User guide, blog, About page, light and dark themes, and search.
