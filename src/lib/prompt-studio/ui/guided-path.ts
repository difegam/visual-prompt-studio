import { PURPOSES, TARGETS, BLANK_RECIPE, type Recipe } from "../domain/recipe";

export const STEP_IDS = ["describe", "look", "refine", "send"] as const;
export type StepId = (typeof STEP_IDS)[number];

export interface StepInfo {
  id: StepId;
  label: string;
  heading: string;
}

export const STEPS: readonly StepInfo[] = [
  {
    id: "describe",
    label: "Describe",
    heading: "Describe what you are making",
  },
  { id: "look", label: "Look", heading: "Choose a look" },
  { id: "refine", label: "Refine", heading: "Refine colors and type" },
  { id: "send", label: "Send", heading: "Send it to your model" },
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
      return recipe.idea.trim() ? (purpose ?? "") : "Not started";
    }
    case "look":
      return ctx.directionName
        ? ctx.directionName
        : lookChosen(recipe, ctx)
          ? "Custom look"
          : "Starting look";
    case "refine":
      return refineChosen(recipe) ? "Adjusted" : "From the look";
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
