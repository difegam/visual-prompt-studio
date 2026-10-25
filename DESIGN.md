---
name: Visual Prompt Studio
description: A calm, print-shop composing desk where layout, imagery and finish are chosen as separate color-coded layers and signed off on a live prompt proof.
colors:
  paper: "#eceee8"
  sheet: "#f8f9f5"
  ink: "#1a1c1f"
  muted: "#586059"
  line: "#c6ccc3"
  accent: "#2238c2"
  accent-ink: "#ffffff"
  cyan-layout: "#0089bf"
  magenta-imagery: "#cf2477"
  yellow-finish: "#b88a00"
  ok: "#2f6b3f"
  warn: "#8f5600"
  bad: "#a3322a"
  paper-dark: "#15171a"
  sheet-dark: "#1e2125"
  ink-dark: "#e4e7e1"
  muted-dark: "#9aa29b"
  line-dark: "#353b37"
  accent-dark: "#93a2ff"
  accent-ink-dark: "#10132a"
  cyan-layout-dark: "#3cb6e8"
  magenta-imagery-dark: "#f0619f"
  yellow-finish-dark: "#e2b73c"
  ok-dark: "#7cc48d"
  warn-dark: "#e0a54a"
  bad-dark: "#ff8a7f"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(32px, 4vw, 44px)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.035em"
    fontVariation: "font-stretch: 75%"
  headline:
    fontFamily: "Bricolage Grotesque Variable, Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
    fontVariation: "font-stretch: 88%"
  title:
    fontFamily: "Bricolage Grotesque Variable, Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "Bricolage Grotesque Variable, Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Bricolage Grotesque Variable, Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.5
  kicker:
    fontFamily: "Bricolage Grotesque Variable, Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.06em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "14px"
  lg: "24px"
  xl: "38px"
  gutter: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
    height: "48px"
  button-default:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    height: "46px"
  panel:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
  tile:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  chip-selected:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
---

# Design System: Visual Prompt Studio

Scope: this file governs the Prompt Studio (`/`) and the guide, styled in `src/lib/prompt-studio/ui/styles.css`. The blog, about and author pages still use the Astro template theme (Heebo and Signika, near-black primary, daisyUI, `src/styles/`). That is a separate system and has not been reconciled with this one. Do not copy its tokens into studio work.

## Overview

**Creative North Star: "The Press Proof"**

The studio is a composing desk beside a proof. On the left the user sets three independent separations (Layout, Imagery, Finish). On the right a sticky proof column shows the result under crop marks: a sketch of the composition and the compiled prompt, each layer underlined in its own ink. The metaphor is practical, not decorative. It explains why layers are color-coded, why the logo is a registration mark, and why the prompt is treated as a proof to check before copying.

The voice is calm, precise and tool-first. Surfaces are pale paper and sheet greys with a faint green cast, text is near-black ink, and a single cobalt carries every action. Color outside the cobalt is information: cyan, magenta and yellow mean Layout, Imagery and Finish, and black ink means type. Expression is concentrated in one place, the condensed, heavy display headline set in a variable-width face. Everything else stays quiet so the compiled prompt, the product, is the loudest object on the screen.

It rejects the generic AI-tool look: gradient hero, glow, purple, floating glass cards. It also rejects the opposite, a flat form-builder with no sense of craft.

**Key Characteristics:**

- CMYK coding is structural. C = Layout, M = Imagery, Y = Finish, K = type, wherever a layer appears.
- One action color (cobalt). Never used for layer coding.
- Hairline borders and tonal layering instead of shadows.
- One variable typeface; hierarchy comes from weight and width, not from font pairing.
- Two-column desk on desktop (composer + sticky proof); on narrow screens the proof becomes a bottom sheet over a fixed mobile bar.
- Light and dark are both first-class and follow the OS unless the user picks one.

## Colors

A paper-and-ink neutral set, one cobalt, and three process inks. Dark mode keeps the same roles with lifted, slightly desaturated values.

### Primary

- **Proofing Cobalt** (#2238c2; dark #93a2ff): the only action color. Primary buttons, focus rings, links, the selected target model, hover on direction cards and info triggers. Text on it is white (dark mode: #10132a).

### Secondary (process inks, information only)

- **Layout Cyan** (#0089bf; dark #3cb6e8): the Layout layer. Tab underline, step marker, selected-tile ring, prompt underline for layout phrases.
- **Imagery Magenta** (#cf2477; dark #f0619f): the Imagery layer. Also the center dot of the registration-mark logo.
- **Finish Yellow** (#b88a00; dark #e2b73c): the Finish (print technique) layer.

### Neutral

- **Press Paper** (#eceee8; dark #15171a): page background and the app bar.
- **Proof Sheet** (#f8f9f5; dark #1e2125): raised surfaces: panels, inputs, tiles, the proof column, the prompt box.
- **Ink** (#1a1c1f; dark #e4e7e1): primary text, the K separation, strong borders on hover and selection.
- **Graphite Muted** (#586059; dark #9aa29b): secondary text, help copy, inactive tabs, chip labels.
- **Trim Line** (#c6ccc3; dark #353b37): every hairline border and divider.

### Status

- **Proof Green** (#2f6b3f; dark #7cc48d), **Caution Amber** (#8f5600; dark #e0a54a), **Error Red** (#a3322a; dark #ff8a7f): validation, notices and the red exclusion mark on selected avoid chips.

### Named Rules

**The Separation Rule.** Cyan, magenta and yellow only ever mean Layout, Imagery and Finish. Never use them as decoration, status or brand accent. Black ink means type.

**The One Action Rule.** Cobalt marks what the user can do next. If two things on screen are cobalt-filled and both are not obvious primary actions, one is wrong.

**The Paper Rule.** Backgrounds are tinted, never pure white or pure black. Raise a surface by switching from Paper to Sheet, not by adding a shadow.

## Typography

**UI Font:** Bricolage Grotesque Variable (fallback `ui-sans-serif, system-ui, sans-serif`). The weight and width axes are used deliberately.
**Specimen faces:** Inter, Oswald, Josefin Sans, Archivo Black, Bebas Neue, Limelight, Fraunces, Cormorant Garamond, Shippori Mincho, IBM Plex Mono, Roboto, Open Sans, Montserrat and Poppins are loaded only to preview the type choices the user can put in a prompt. They are content, not interface type.

**Character:** One characterful grotesque doing all the work. The display headline is squeezed to 75% width at weight 800 so it reads like poster type; section headings relax to 88%; body is normal width and weight.

### Hierarchy

- **Display** (800, clamp(32px, 4vw, 44px), 1.04, -0.035em, width 75%): the single page headline above the brief, max about 18ch.
- **Headline** (700, 21px, -0.02em, width 88%): section titles such as "Visual language". The inspiration heading scales to clamp(26px, 3vw, 34px) at width 80%.
- **Title** (700, 15px): tab labels, card titles. Direction card titles are smaller still (12px, 500).
- **Body** (400, 15px, 1.5): descriptions and guidance, capped around 54 to 68ch. Secondary copy is Graphite Muted at 13px.
- **Label** (600, 13px): field labels, chips, buttons (buttons 14px). Hints inside labels are 12px muted at weight 400.
- **Kicker** (600, 12px, 0.06em, uppercase): the short eyebrow above the intro heading. Use sparingly.
- **Prompt text** (400, 13px, 1.65, pre-wrap): the compiled prompt. Counts use tabular numerals.

### Named Rules

**The One Voice Rule.** No second UI typeface. Create hierarchy with weight, width and size.

**The Quiet Eyebrow Rule.** Uppercase tracked text appears once per region at most, and never as a decorative label on every card.

## Layout

A two-column desk: a fluid composer column and a sticky proof column (360 to 480px) with a 28 to 72px fluid gutter, centered at a 1380 to 1480px maximum. The composer stacks the brief, then Visual language, then more sections with 38px between major blocks. Inside panels, fields sit on a two-column grid with 18px gaps, collapsing to one column on phones. Spacing is rhythmic and tight: 6, 8, 12, 14, 18, 24px steps.

Responsive: at 1040px and below, the desk becomes a single column and the proof turns into a bottom sheet (max 58dvh) above a fixed mobile bar with a "See prompt" toggle. At 640px, grids collapse to one column and cards lose some radius. The nav menu is inline at 1024px and above and a collapsing disclosure below it. Body padding respects `safe-area-inset-*`. Touch targets are at least 44px (inputs 46px, primary action 48px, info triggers 36px with a larger hit area).

## Elevation & Depth

Flat and tonal. Depth is Paper under Sheet, plus 1px Trim Line borders; nearly nothing has a shadow at rest. Shadows exist only where something truly floats or overlaps content.

### Shadow Vocabulary

- **Popover** (`box-shadow: 0 14px 36px color-mix(in srgb, #000 28%, transparent)`): field-info popovers.
- **Mobile proof sheet** (`box-shadow: 0 -12px 32px -12px color-mix(in srgb, var(--ink) 30%, transparent)`): the bottom sheet above the page.
- **Copy dock** (`box-shadow: 0 -10px 12px -8px color-mix(in srgb, var(--ink) 14%, transparent)`): the sticky Copy row at the bottom of the scrolling proof column, so content visibly passes under it.
- **Selected target** (`box-shadow: 0 4px 12px -4px color-mix(in srgb, var(--accent) 60%, transparent)`): the chosen model button only.
- **Selection ring** (`box-shadow: inset 0 0 0 2px var(--layer)`): selected style tiles; inset rings are the system's standard selection mark, not an elevation.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. A shadow means overlap (popover, sheet, dock) or an explicit selected state, never decoration.

## Shapes

Softly squared, with radius growing with the size of the container. Controls use 6px (buttons) and 10px (inputs, selects, the prompt box); tiles, cards and sketch sheets use 12 to 14px; major panels (brief, layers, proof, intro) use 16px; chips and pills are fully round (999px). Process-ink markers are small solid circles (10 to 12px). The registration-mark logo (circle, crosshair, magenta center dot) and the corner crop marks drawn around the composition sketch are the system's only decorative geometry; both come from print and both carry meaning.

## Components

### Buttons

- **Shape:** gently squared (6px); 14px label at weight 600; 8px 14px padding; 44px or taller touch height; primary action 48px.
- **Default:** Sheet fill, Trim Line border; the border darkens to Ink on hover.
- **Primary:** Proofing Cobalt fill, white text; hover brightens by 8% (`filter: brightness(1.08)`).
- **Ghost:** no fill or border until hover or `aria-pressed`, then Sheet with a hairline. Used for Import, Export, Reset and low-priority actions.
- **Copy group:** a joined set of buttons sharing one rounded outline; only outer corners are rounded.

### Inputs / Fields

- **Style:** Sheet fill, 1px Trim Line, 10px radius, 46px minimum height; selects use a drawn chevron and 36px right padding.
- **Idea field:** the one emphasized input. Larger (18px, 88px tall); its border may take Ink at rest.
- **Focus:** a 2px Proofing Cobalt outline with 2px offset on every focusable element (`:focus-visible`).
- **Labels:** 13px weight 600 above the field with an optional muted hint; each carries an info trigger that opens a popover.

### Tabs (layer switcher)

- Three text tabs, each with a process-ink dot, the layer name, and the current choice in muted small text. The selected tab gets a 3px underline in its own ink (cyan, magenta or yellow) and Ink text. Inactive tabs are Graphite Muted. The strip scrolls horizontally on narrow screens.

### Tiles and direction cards

- **Style tiles:** Sheet, 1px border, 12px radius, art preview on top (16:11) and meta below. Selected state: inset 2px ring in the layer's ink plus a 12px dot at the top-right with a Sheet halo. Hover darkens the border to Graphite Muted.
- **Direction cards:** 14px radius, a 132px-tall sketch thumbnail on a Paper-tinted band, title, rationale and an Apply button. Hover shifts the border to Cobalt. Applying a card changes only visual layers, never the user's words.

### Chips

- Pills with a 1px Trim Line border and muted 13px label. Selected: Ink text and Ink border. A selected avoid/exclusion chip adds a short red bar before its label; skipped chips are visibly de-emphasized and explained.

### Segmented controls and target picker

- The Send-to picker is a five-up grid of icon-only 52px buttons in a tinted tray (16px radius). The selected target fills Cobalt with a soft cobalt shadow; hover shows a small Ink tooltip with the model name. Text-mode and aspect-ratio controls use the same segmented language.

### Proof column

- A 16px-radius Sheet panel holding: the composition sketch under 14px crop marks (corner ticks drawn with gradients), a four-item separation legend (C, M, Y, K), the prompt box, notices, and the sticky copy dock. Phrases inside the prompt carry a 2px bottom rule in their layer's ink, so the user can see which layer wrote which words.

### Palette swatches and variations

- **Swatches:** a 92px-wide column per color: a 54px-tall chip (6px radius, 1px Trim Line) that hides a native color input, then the color name (12px, 600) and its hex (12px, muted, tabular numerals). The whole chip is the click target.
- **Variations:** small buttons (6px radius, 5px padding) each holding an 84x20px strip of the palette's colors (3px radius) above a 12px muted label. Hover or selected switches the border and label to Ink.

### Signature and font picker

- **Signature options:** two-up cards (6px radius, Sheet, hairline) with a 14px bold name over a 13px muted description. Selected: Ink border plus an inset 1.5px Ink ring. Ink, not a process ink, because these choices are type (K).
- **Font picker:** a modal dialog up to 1080px wide (16px radius, hairline border, 24px/64px-blur shadow `0 24px 64px rgb(17 24 20 / 28%)`) with a search field, category chips, a result count, and a live preview in the real specimen face. It is the one place specimen faces appear at large size.

### Mobile bar

- Below 1040px a fixed bottom bar on Paper with a top hairline holds equal-width buttons (including "See prompt", which opens the proof sheet above it). It adds `safe-area-inset-bottom` padding and sits at z-index 6, above the sheet (5).

### Disclosures

- Native `details` with a 14px radius, hairline border and an arrow; a title in 700 with a one-line muted description. Used to keep optional detail (text and size, intro, prompt breakdown) out of the way.

### Navigation

- A sticky 56px bar on Paper with a bottom hairline. Brand is the registration-mark glyph plus "Visual Prompt Studio" (17px, 700, width 85%). Links are muted weight 500 and turn Ink on hover. Below 1024px the links and recipe tools collapse into a Menu disclosure that closes on selection or Escape.

## Do's and Don'ts

### Do:

- **Do** code layers with the process inks every time they appear (tab, tile, step marker, prompt underline, legend), and keep the mapping C = Layout, M = Imagery, Y = Finish, K = type.
- **Do** use Proofing Cobalt for actions, selection of a target model, and focus; keep it off decoration.
- **Do** build raised surfaces with Paper to Sheet plus a 1px Trim Line border.
- **Do** keep the display headline condensed and heavy (width 75%, weight 800) and every other text role at normal width.
- **Do** keep every interactive target at 44px or taller and every control reachable with a visible 2px cobalt focus ring.
- **Do** give a dark-mode counterpart for every new color token, and test both themes.
- **Do** keep user-entered text (the brief, exact poster text, the compiled prompt) in the most legible type; the interface should recede around it.

### Don't:

- **Don't** use cyan, magenta or yellow as status, accent or ornament; they are reserved for layer coding.
- **Don't** add gradients, glows, glass blur, side-stripe card accents or hero-metric tiles.
- **Don't** add a second UI typeface, or use specimen faces (Fraunces, Oswald, etc.) for interface text.
- **Don't** place shadows on resting cards or panels; use a border and tonal change.
- **Don't** use pure white or pure black backgrounds.
- **Don't** invent testimonials, usage counts or popularity claims in copy; curated picks are described as studio recommendations.
- **Don't** pull Heebo, Signika, daisyUI component skins or the template's near-black primary into studio surfaces.
