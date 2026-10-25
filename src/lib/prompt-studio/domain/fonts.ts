/**
 * Bundled specimen fonts (Fontsource 5.3.0, all OFL-1.1, latin subset).
 * An image model never receives font files: the prompt describes the typeface class.
 * For guaranteed typography, composite real text after generation.
 */
export interface FontDef {
  readonly id: string;
  readonly family: string;
  readonly css: string;
  readonly weights: readonly number[];
  readonly category: "sans" | "serif" | "display" | "mono";
  readonly popular: boolean;
  readonly italic: boolean;
  readonly classification: string;
  /** How the typeface is described to an image model. */
  readonly prompt: string;
  readonly promptEs: string;
}

export const FONTS = [
  {
    id: "inter",
    family: "Inter",
    css: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    weights: [400, 700],
    classification: "Neo-grotesque",
    category: "sans",
    popular: true,
    italic: true,
    prompt: "a neutral neo-grotesque sans-serif (Helvetica class)",
    promptEs: "una sans-serif neogrotesca neutra (tipo Helvetica)",
  },
  {
    id: "oswald",
    family: "Oswald",
    css: "'Oswald', 'Arial Narrow', sans-serif",
    weights: [500, 700],
    classification: "Condensed gothic",
    category: "display",
    popular: true,
    italic: false,
    prompt: "a bold condensed gothic sans-serif",
    promptEs: "una sans-serif gótica condensada y gruesa",
  },
  {
    id: "josefin",
    family: "Josefin Sans",
    css: "'Josefin Sans', 'Futura', 'Century Gothic', sans-serif",
    weights: [400, 700],
    classification: "Geometric sans",
    category: "sans",
    popular: false,
    italic: true,
    prompt: "a geometric sans-serif with circular bowls (Futura class)",
    promptEs: "una sans-serif geométrica de óvalos circulares (tipo Futura)",
  },
  {
    id: "archivo-black",
    family: "Archivo Black",
    css: "'Archivo Black', 'Arial Black', sans-serif",
    weights: [400],
    classification: "Heavy grotesque",
    category: "display",
    popular: false,
    italic: false,
    prompt: "an ultra-heavy grotesque sans-serif",
    promptEs: "una grotesca ultranegra",
  },
  {
    id: "bebas",
    family: "Bebas Neue",
    css: "'Bebas Neue', 'Impact', sans-serif",
    weights: [400],
    classification: "Display caps",
    category: "display",
    popular: false,
    italic: false,
    prompt: "a tall all-caps condensed display sans-serif",
    promptEs: "una sans-serif condensada de solo mayúsculas",
  },
  {
    id: "limelight",
    family: "Limelight",
    css: "'Limelight', 'Didot', serif",
    weights: [400],
    classification: "Art Deco display",
    category: "display",
    popular: false,
    italic: false,
    prompt: "a high-contrast Art Deco display face",
    promptEs: "una display art déco de alto contraste",
  },
  {
    id: "fraunces",
    family: "Fraunces",
    css: "'Fraunces', 'Georgia', serif",
    weights: [400, 700],
    classification: "Soft old-style serif",
    category: "serif",
    popular: false,
    italic: true,
    prompt: "a soft, high-contrast old-style display serif",
    promptEs: "una serif display de estilo antiguo, suave y contrastada",
  },
  {
    id: "cormorant",
    family: "Cormorant Garamond",
    css: "'Cormorant Garamond', 'Garamond', serif",
    weights: [500, 700],
    classification: "Garalde serif",
    category: "serif",
    popular: false,
    italic: true,
    prompt: "a refined Garamond-style serif",
    promptEs: "una serif refinada tipo Garamond",
  },
  {
    id: "shippori",
    family: "Shippori Mincho",
    css: "'Shippori Mincho', 'Hiragino Mincho ProN', serif",
    weights: [400, 700],
    classification: "Mincho serif",
    category: "serif",
    popular: false,
    italic: false,
    prompt: "a delicate mincho-style serif with thin horizontals",
    promptEs: "una serif estilo mincho de horizontales finas",
  },
  {
    id: "plex-mono",
    family: "IBM Plex Mono",
    css: "'IBM Plex Mono', 'Courier New', monospace",
    weights: [400, 600],
    classification: "Technical mono",
    category: "mono",
    popular: false,
    italic: true,
    prompt: "a technical monospaced typeface",
    promptEs: "una monoespaciada técnica",
  },
  {
    id: "roboto",
    family: "Roboto",
    css: "'Roboto', Arial, sans-serif",
    weights: [400, 700],
    classification: "Neo-grotesque",
    category: "sans",
    popular: true,
    italic: true,
    prompt:
      "a clean neo-grotesque sans-serif with humanist warmth (Roboto class)",
    promptEs:
      "una sans-serif neogrotesca limpia y de calidez humanista (tipo Roboto)",
  },
  {
    id: "open-sans",
    family: "Open Sans",
    css: "'Open Sans', Arial, sans-serif",
    weights: [400, 700],
    classification: "Humanist sans",
    category: "sans",
    popular: true,
    italic: true,
    prompt: "an open, highly legible humanist sans-serif (Open Sans class)",
    promptEs: "una sans-serif humanista abierta y muy legible (tipo Open Sans)",
  },
  {
    id: "montserrat",
    family: "Montserrat",
    css: "'Montserrat', Arial, sans-serif",
    weights: [400, 700],
    classification: "Geometric sans",
    category: "sans",
    popular: true,
    italic: true,
    prompt:
      "a geometric urban sans-serif with broad proportions (Montserrat class)",
    promptEs:
      "una sans-serif geométrica y urbana de proporciones amplias (tipo Montserrat)",
  },
  {
    id: "poppins",
    family: "Poppins",
    css: "'Poppins', Arial, sans-serif",
    weights: [400, 700],
    classification: "Geometric sans",
    category: "sans",
    popular: true,
    italic: true,
    prompt:
      "a rounded geometric sans-serif with circular forms (Poppins class)",
    promptEs:
      "una sans-serif geométrica redondeada de formas circulares (tipo Poppins)",
  },
] as const satisfies readonly FontDef[];

export type FontId = (typeof FONTS)[number]["id"];
export const FONT_IDS = FONTS.map((f) => f.id) as [FontId, ...FontId[]];
const fontById = new Map<string, FontDef>(FONTS.map((f) => [f.id, f]));
export const getFont = (id: string): FontDef | undefined => fontById.get(id);
