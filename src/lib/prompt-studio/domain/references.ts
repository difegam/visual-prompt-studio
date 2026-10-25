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
  | "learning"
  | "docs";
export type Cost = "free" | "freemium" | "paid";
export type RefStatus = "active" | "dormant" | "pivoted";

export type LearningTopicId =
  "hierarchy" | "typography" | "color-rhythm" | "material" | "story-place";

export const LEARNING_TOPICS: readonly {
  readonly id: LearningTopicId;
  readonly label: string;
}[] = [
  { id: "hierarchy", label: "Hierarchy" },
  { id: "typography", label: "Typography" },
  { id: "color-rhythm", label: "Color and rhythm" },
  { id: "material", label: "Material" },
  { id: "story-place", label: "Story and place" },
];

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
  /** Concept topics for design-learning sources. Absent on other kinds. */
  readonly topics?: readonly LearningTopicId[];
  readonly checked: string;
  /** Optional context-aware link, built only from URL patterns observed on the site. */
  readonly deepLink?: (
    ctx: LinkContext,
  ) => { label: string; href: string } | null;
}

const CHECKED = "2026-10-24";
const RESEARCH_CHECKED = "2026-10-25";

export const KIND_LABELS: Record<ReferenceKind, string> = {
  styles: "Style library",
  sref: "Style codes",
  prompts: "Prompt search",
  builder: "Prompt builder",
  community: "Community",
  marketplace: "Marketplace",
  learning: "Design learning",
  docs: "Model docs",
};

export const REFERENCES: readonly ReferenceDef[] = [
  {
    id: "figma-web-trends-2026",
    name: "Figma web design trends for 2026",
    url: "https://www.figma.com/resource-library/web-design-trends/",
    kind: "learning",
    bestFor:
      "Expressive typography, saturated color, collage, retrofuturism, and the role of white space.",
    models: "Model-independent design principles",
    cost: "free",
    status: "active",
    note: "An editorial overview. Web interaction trends do not translate directly into image prompts.",
    checked: RESEARCH_CHECKED,
    topics: ["typography", "color-rhythm"],
  },
  {
    id: "adobe-design-trends-2026",
    name: "Adobe Express design trends for 2026",
    url: "https://www.adobe.com/express/learn/blog/design-trends-2026",
    kind: "learning",
    bestFor:
      "Organic imperfection, sensory materials, collage, and local visual storytelling.",
    models: "Model-independent design principles",
    cost: "free",
    status: "active",
    note: "A design forecast that offers directions to explore, not a universal recipe for a brief.",
    checked: RESEARCH_CHECKED,
    topics: ["material", "story-place"],
  },
  {
    id: "adobe-creative-trends-2026",
    name: "Adobe 2026 Creative Trends Forecast",
    url: "https://business.adobe.com/resources/creative-trends-report.html",
    kind: "learning",
    bestFor:
      "Sensory imagery, authentic connection, surreal play, and culturally specific details.",
    models: "Model-independent design principles",
    cost: "free",
    status: "active",
    note: "A creative forecast. Local cues still need to come from the subject and the user's brief.",
    checked: RESEARCH_CHECKED,
    topics: ["material", "story-place"],
  },
  {
    id: "behance-design-trends-2026",
    name: "Behance Design Trends 2026",
    url: "https://www.behance.net/gallery/239027109/Design-Trends-2026",
    kind: "community",
    bestFor:
      "Practitioner examples of raw aesthetics, imperfect lettering, micro-maximalism, and chromatic expression.",
    models: "Model-independent visual references",
    cost: "free",
    status: "active",
    note: "A practitioner synthesis, not a measured ranking of design effectiveness.",
    checked: RESEARCH_CHECKED,
  },
  {
    id: "dribbble-design-trends",
    name: "Dribbble Design Trends gallery",
    url: "https://dribbble.com/tags/design-trends",
    kind: "community",
    bestFor:
      "A visual reference gallery for comparing typography, grids, color, and optical imagery.",
    models: "Model-independent visual references",
    cost: "free",
    status: "active",
    note: "Visual examples only. Engagement counts are not research evidence or a basis for popularity claims.",
    checked: RESEARCH_CHECKED,
  },
  {
    id: "figma-typography",
    name: "Figma typography in design",
    url: "https://www.figma.com/resource-library/typography-in-design/",
    kind: "learning",
    bestFor:
      "Type hierarchy, alignment, spacing, type selection, and legibility.",
    models: "Model-independent design principles",
    cost: "free",
    status: "active",
    checked: RESEARCH_CHECKED,
    topics: ["typography", "hierarchy"],
  },
  {
    id: "cooper-how-posters-work",
    name: "Cooper Hewitt: How Posters Work",
    url: "https://www.si.edu/exhibitions/how-posters-work%3Aevent-exhib-5759",
    kind: "learning",
    bestFor:
      "Focusing attention, telling a story, amplifying a message, and using scale, diagonals, and systems.",
    models: "Model-independent design principles",
    cost: "free",
    status: "active",
    note: "An archived exhibition overview with enduring poster-design strategies.",
    checked: RESEARCH_CHECKED,
    topics: ["hierarchy", "story-place"],
  },
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
    id: "gemini-image-guide",
    name: "Gemini image generation",
    url: "https://ai.google.dev/gemini-api/docs/image-generation",
    kind: "docs",
    bestFor:
      "Nano Banana models: aspect ratios, reference images, text rendering, and conversational edits.",
    models: "Nano Banana (Gemini image models)",
    cost: "free",
    status: "active",
    checked: RESEARCH_CHECKED,
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

const REFERENCES_BY_ID = new Map(
  REFERENCES.map((reference) => [reference.id, reference]),
);

export function getReference(id: string): ReferenceDef | undefined {
  return REFERENCES_BY_ID.get(id);
}

/**
 * Kind and topic filters combine. A topic only applies to design-learning
 * sources, so a stale topic cannot hide results of any other kind.
 */
export function filterReferences(
  references: readonly ReferenceDef[],
  kind: ReferenceKind | "all",
  topic: LearningTopicId | "all",
): readonly ReferenceDef[] {
  return references.filter(
    (ref) =>
      (kind === "all" || ref.kind === kind) &&
      (topic === "all" ||
        kind !== "learning" ||
        ref.topics?.includes(topic) === true),
  );
}
