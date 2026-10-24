import type { TargetId } from "./recipe";

/**
 * External inspiration sources. The app only links out; it never fetches.
 * `checked` records when the entry was last verified by visiting the site.
 * Status is an observation, not a judgment:
 *   active   — content updated recently, works as described
 *   dormant  — reachable, but no sign of recent updates (e.g. old copyright, old models)
 *   pivoted  — the site now mainly does something else
 */
export type ReferenceKind =
  | "styles"
  | "sref"
  | "prompts"
  | "builder"
  | "community"
  | "marketplace"
  | "docs";
export type Cost = "free" | "freemium" | "paid";
export type RefStatus = "active" | "dormant" | "pivoted";

export interface LinkContext {
  readonly styleNames: readonly string[];
  readonly target: TargetId;
}

export interface ReferenceDef {
  readonly id: string;
  readonly name: string;
  readonly url: `https://${string}`;
  readonly kind: ReferenceKind;
  readonly bestFor: string;
  readonly models: string;
  readonly cost: Cost;
  readonly status: RefStatus;
  readonly note?: string;
  readonly checked: string;
  /** Optional context-aware link, built only from URL patterns observed on the site. */
  readonly deepLink?: (
    ctx: LinkContext,
  ) => { label: string; href: string } | null;
}

const CHECKED = "2026-10-24";

export const KIND_LABELS: Record<ReferenceKind, string> = {
  styles: "Style library",
  sref: "Style codes",
  prompts: "Prompt search",
  builder: "Prompt builder",
  community: "Community",
  marketplace: "Marketplace",
  docs: "Model docs",
};

export const REFERENCES: readonly ReferenceDef[] = [
  {
    id: "midlibrary",
    name: "Midlibrary",
    url: "https://midlibrary.io/",
    kind: "styles",
    bestFor:
      "Seeing how a named movement, artist or technique renders, with benchmark samples per Midjourney version.",
    models: "Midjourney (V6.1 to V8.2, niji)",
    cost: "freemium",
    status: "active",
    note: "Thousands of styles plus a large sref code library. Personal collections are capped on the free tier.",
    checked: CHECKED,
    deepLink: ({ styleNames }) => {
      const term = styleNames[0];
      return term
        ? {
            label: `Search “${term}”`,
            href: `https://midlibrary.io/library?term=${encodeURIComponent(term)}`,
          }
        : null;
    },
  },
  {
    id: "srefhunt",
    name: "SrefHunt",
    url: "https://srefhunt.com/",
    kind: "sref",
    bestFor: "Browsing community style reference codes to paste into --sref.",
    models: "Midjourney (also Nano Banana prompts)",
    cost: "free",
    status: "active",
    note: "Community submissions are reviewed before listing. Paste a code into the Midjourney sref field here.",
    checked: CHECKED,
    deepLink: () => ({
      label: "Browse all codes",
      href: "https://srefhunt.com/sref/",
    }),
  },
  {
    id: "prompthero",
    name: "PromptHero",
    url: "https://prompthero.com/",
    kind: "prompts",
    bestFor:
      "Image-first prompt search across models. See the result, then read the prompt that made it.",
    models:
      "ChatGPT Image, Midjourney, FLUX, Nano Banana, Stable Diffusion, Sora, Veo",
    cost: "freemium",
    status: "active",
    checked: CHECKED,
    deepLink: ({ target }) => {
      const path: Partial<Record<TargetId, string>> = {
        midjourney: "midjourney-prompts",
        flux: "flux-prompts",
        sdxl: "stable-diffusion-prompts",
      };
      const p = path[target];
      return p
        ? { label: "Open model gallery", href: `https://prompthero.com/${p}` }
        : null;
    },
  },
  {
    id: "hartnup",
    name: "Poster Prompts",
    url: "https://john.hartnup.uk/poster-prompts",
    kind: "styles",
    bestFor:
      "100 named poster styles with copy-paste ChatGPT prompts and example posters. The source of the beailabs catalog.",
    models: "ChatGPT image generation",
    cost: "free",
    status: "active",
    note: "No license is stated: use it for reference, do not republish the prompts.",
    checked: CHECKED,
  },
  {
    id: "promptomania",
    name: "promptoMANIA",
    url: "https://promptomania.com/",
    kind: "builder",
    bestFor:
      "A visual builder for assembling modifiers when you know the model but not the vocabulary.",
    models:
      "Midjourney, FLUX, Stable Diffusion, Ideogram, Leonardo, ChatGPT, Gemini",
    cost: "freemium",
    status: "active",
    note: "Overlaps with this tool. Useful for its modifier vocabulary, less for art direction.",
    checked: CHECKED,
  },
  {
    id: "arthub",
    name: "Arthub",
    url: "https://arthub.ai/",
    kind: "community",
    bestFor: "Community AI art with the prompts attached.",
    models: "Mostly Stable Diffusion / SDXL tags",
    cost: "free",
    status: "dormant",
    note: "Reachable, but the footer still reads 2024 and tags point to older SD models.",
    checked: CHECKED,
  },
  {
    id: "publicprompts",
    name: "Public Prompts",
    url: "https://publicprompts.art/",
    kind: "community",
    bestFor: "Free, tested Stable Diffusion prompt collections and models.",
    models: "Stable Diffusion, LoRA, DreamBooth",
    cost: "free",
    status: "pivoted",
    note: "The homepage is now mostly an AI tools directory; the prompt section is secondary.",
    checked: CHECKED,
  },
  {
    id: "promptbase",
    name: "PromptBase",
    url: "https://promptbase.com/",
    kind: "marketplace",
    bestFor:
      "Buying proven templates for a specific look when you need it repeatable today.",
    models: "Midjourney, ChatGPT Image, FLUX, Stable Diffusion and many more",
    cost: "paid",
    status: "active",
    note: "Per-prompt purchases or a monthly subscription. Quality varies by seller; check the samples.",
    checked: CHECKED,
    deepLink: ({ target }) => {
      const path: Partial<Record<TargetId, string>> = {
        midjourney: "midjourney",
        "gpt-image": "chatgpt-image",
      };
      const p = path[target];
      return p
        ? { label: "Open model category", href: `https://promptbase.com/${p}` }
        : null;
    },
  },
  {
    id: "openai-guide",
    name: "OpenAI image prompting",
    url: "https://developers.openai.com/api/docs/guides/image-prompting",
    kind: "docs",
    bestFor:
      "How GPT Image models read goals, exact text, and what to change versus keep.",
    models: "GPT Image 2 / ChatGPT Images",
    cost: "free",
    status: "active",
    checked: CHECKED,
  },
  {
    id: "mj-no",
    name: "Midjourney --no",
    url: "https://docs.midjourney.com/docs/no",
    kind: "docs",
    bestFor:
      "Exclusion syntax and why concrete nouns work better than phrases.",
    models: "Midjourney",
    cost: "free",
    status: "active",
    checked: CHECKED,
  },
  {
    id: "bfl-negative",
    name: "FLUX.2 and negatives",
    url: "https://help.bfl.ai/articles/7734566352-does-flux-2-support-negative-prompting",
    kind: "docs",
    bestFor:
      "Why FLUX ignores “no X” and how to phrase the result you want instead.",
    models: "FLUX.2",
    cost: "free",
    status: "active",
    checked: CHECKED,
  },
];
