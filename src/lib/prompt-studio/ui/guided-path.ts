import { PURPOSES, TARGETS, BLANK_RECIPE, type Recipe } from "../domain/recipe";

export const STEP_IDS = ["describe", "look", "refine", "send"] as const;
export type StepId = (typeof STEP_IDS)[number];

export interface StepInfo {
  id: StepId;
  label: string;
  heading: string;
  /** Inner markup of a 24x24 stroke icon. */
  icon: string;
  /** One sentence on what to do here, shown under the step heading. */
  purpose: string;
  /** The step can be skipped without losing anything. */
  optional?: boolean;
}

const ICONS: Record<StepId, string> = {
  describe:
    '<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/>',
  look: '<circle cx="9" cy="9" r="5"/><circle cx="15" cy="9" r="5"/><circle cx="12" cy="15" r="5"/>',
  refine:
    '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  send: '<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>',
};

export const STEPS: readonly StepInfo[] = [
  {
    id: "describe",
    icon: ICONS.describe,
    label: "Describe",
    heading: "Describe what you are making",
    purpose:
      "Say what the image is and what it is for. Only the first box is needed.",
  },
  {
    id: "look",
    icon: ICONS.look,
    label: "Look",
    heading: "Choose a look",
    purpose:
      "Pick a ready-made direction to set the style in one click. You can change any part of it later.",
  },
  {
    id: "refine",
    icon: ICONS.refine,
    label: "Refine",
    heading: "Refine colors and type",
    purpose:
      "Swap the colors or the typeface. Your look already brings its own, so you can skip this.",
    optional: true,
  },
  {
    id: "send",
    icon: ICONS.send,
    label: "Send",
    heading: "Send it to your model",
    purpose:
      "Pick the image tool you will paste into, then copy the prompt. Nothing is sent from here.",
  },
];

/** What the guided path needs to know besides the recipe itself. */
export interface PathContext {
  /** A direction was applied in this session. */
  directionName: string | null;
}

function sameStyles(a: Recipe, b: Recipe): boolean {
  return (
    a.styles.design === b.styles.design &&
    a.styles.art === b.styles.art &&
    a.styles.technique === b.styles.technique
  );
}

function samePalette(a: Recipe, b: Recipe): boolean {
  return a.palette.every((color, i) => color.hex === b.palette[i]?.hex);
}

function lookChosen(recipe: Recipe, ctx: PathContext): boolean {
  return ctx.directionName !== null || !sameStyles(recipe, BLANK_RECIPE);
}

function refineChosen(recipe: Recipe): boolean {
  return !samePalette(recipe, BLANK_RECIPE) || recipe.font !== "style";
}

export function isStepDone(
  step: StepId,
  recipe: Recipe,
  ctx: PathContext,
): boolean {
  switch (step) {
    case "describe":
      return recipe.idea.trim().length >= 3;
    case "look":
      return lookChosen(recipe, ctx);
    case "refine":
      return refineChosen(recipe);
    case "send":
      // A target always exists; Send counts as done once the brief is usable.
      return recipe.idea.trim().length >= 3 && lookChosen(recipe, ctx);
  }
}

export function stepSummary(
  step: StepId,
  recipe: Recipe,
  ctx: PathContext,
): string {
  switch (step) {
    case "describe": {
      const purpose = PURPOSES.find((p) => p.id === recipe.purpose)?.label;
      return recipe.idea.trim() ? (purpose ?? "Your idea") : "Add your idea";
    }
    case "look":
      return ctx.directionName
        ? ctx.directionName
        : lookChosen(recipe, ctx)
          ? "Custom look"
          : "Pick a direction";
    case "refine":
      return refineChosen(recipe) ? "Adjusted" : "Optional";
    case "send":
      return TARGETS.find((t) => t.id === recipe.target)?.label ?? "";
  }
}

/** The first step that still needs input, or Describe when everything is done. */
export function initialStep(recipe: Recipe, ctx: PathContext): StepId {
  for (const id of ["describe", "look"] as const) {
    if (!isStepDone(id, recipe, ctx)) return id;
  }
  return "describe";
}

export function stepIndex(step: StepId): number {
  return STEP_IDS.indexOf(step);
}

export function neighbour(step: StepId, delta: 1 | -1): StepId | null {
  return STEP_IDS[stepIndex(step) + delta] ?? null;
}

/** Label for the Next button: it names where it leads. */
export function nextLabel(step: StepId): string {
  const following = neighbour(step, 1);
  if (!following) return "Copy prompt";
  return `Next: ${STEPS[stepIndex(following)]?.label ?? ""}`;
}

export function stepAnnouncement(step: StepId): string {
  const info = STEPS[stepIndex(step)];
  return `Step ${stepIndex(step) + 1} of ${STEPS.length}: ${info?.label ?? ""}`;
}

/* ── Expert view preference ───────────────────────────────────────────── */

export const VIEW_KEY = "visual-prompt-studio.view.v1";

export function loadExpert(storage: Pick<Storage, "getItem"> | null): boolean {
  try {
    return storage?.getItem(VIEW_KEY) === "expert";
  } catch {
    return false;
  }
}

export function saveExpert(
  storage: Pick<Storage, "setItem" | "removeItem"> | null,
  expert: boolean,
): void {
  try {
    if (expert) storage?.setItem(VIEW_KEY, "expert");
    else storage?.removeItem(VIEW_KEY);
  } catch {
    // Storage can be blocked; the preference then lasts for this page only.
  }
}
