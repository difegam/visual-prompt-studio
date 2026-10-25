import type { Recipe } from "./recipe";

export type ReadabilityHintTarget = "headline" | "text";

export interface ReadabilityHint {
  readonly id: string;
  readonly priority: number;
  readonly message: string;
  readonly actionLabel: string;
  readonly target: ReadabilityHintTarget;
}

export function getReadabilityHints(
  recipe: Recipe,
): readonly ReadabilityHint[] {
  if (recipe.textMode !== "render") return [];

  const hasHeadline = recipe.headline.trim().length > 0;
  const supportingLineCount = recipe.extraText.filter(
    (line) => line.trim().length > 0,
  ).length;
  const hasText = hasHeadline || supportingLineCount > 0;
  const hints: ReadabilityHint[] = [];

  if (recipe.styles.art === "op-art" && hasText) {
    hints.push({
      id: "op-art-exact-text",
      priority: 10,
      message:
        "Optical patterns can compete with exact text. Keep the copy short and separate it from repeated shapes.",
      actionLabel: hasHeadline ? "Review headline" : "Review text",
      target: hasHeadline ? "headline" : "text",
    });
  }

  if (supportingLineCount >= 3) {
    hints.push({
      id: "dense-supporting-text",
      priority: 20,
      message:
        "Three or more supporting lines can weaken the reading order. Choose one primary line and shorten the rest.",
      actionLabel: "Review text",
      target: "text",
    });
  }

  return hints.sort((a, b) => a.priority - b.priority);
}
