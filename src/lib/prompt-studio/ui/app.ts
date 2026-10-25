import {
  compile,
  effectivePalette,
  type CompiledPrompt,
  type Segment,
} from "../domain/compiler";
import {
  AVOIDS,
  CLICHES,
  DEFAULT_AVOIDS,
  getCliche,
  type AvoidGroup,
  type AvoidId,
  type ClicheId,
} from "../domain/avoids";
import { FONTS, getFont, type FontId } from "../domain/fonts";
import { PALETTE_VARIATIONS, nameForHex } from "../domain/palettes";
import { MIXES, PRESETS, clonePalette } from "../domain/presets";
import {
  GOALS,
  applyDirection,
  filterDirections,
  filterStyles,
  getRecommendations,
  paginateItems,
  type DirectionFilters,
  type StyleFilters,
  type GoalId,
} from "../domain/discovery";
import {
  ASPECT_LABELS,
  DEFAULT_ASPECTS,
  DEFAULT_RECIPE,
  PATTERNS,
  PATTERNS_BY_TARGET,
  PURPOSES,
  SIGNATURES,
  TARGETS,
  aspectRatio,
  customAspectFromDimensions,
  isAspectPreset,
  parseRecipe,
  parseRecipeJson,
  type Aspect,
  type PatternId,
  type PurposeId,
  type Recipe,
  type SignatureId,
  type TargetId,
} from "../domain/recipe";
import {
  KIND_LABELS,
  REFERENCES,
  type ReferenceKind,
} from "../domain/references";
import {
  getStyle,
  stylesOf,
  type ArtId,
  type DesignId,
  type BrowsableStyle,
  type StyleLayer,
  type StyleId,
  type TechniqueId,
} from "../domain/styles";
import { finishSvg, inksFrom, motifSvg, proofSvg } from "./sketch";
import { renderDirectionCard } from "./directions";

/* ── tiny utilities ──────────────────────────────────────────────────── */

function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
}

const esc = (s: string): string =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

type ActiveFilter = { key: string; label: string; value: string };

function renderFilterSummary(
  area: string,
  filters: readonly ActiveFilter[],
): string {
  if (filters.length === 0) return "";
  return `<div class="active-filter-summary" role="group" aria-label="Active filters">
    ${filters
      .map(
        (filter) =>
          `<button type="button" class="active-filter-pill" data-remove-filter="${esc(filter.key)}" aria-label="Remove ${esc(filter.label)} filter: ${esc(filter.value)}"><span>${esc(filter.label)}: ${esc(filter.value)}</span><span class="active-filter-remove" aria-hidden="true">×</span></button>`,
      )
      .join("")}
    <button type="button" class="btn btn-ghost btn-sm active-filter-clear" data-clear-filter-area="${esc(area)}">Clear all</button>
  </div>`;
}

function aspectShapeSvg(aspect: Aspect, boxWidth = 28, boxHeight = 28): string {
  const { w, h } = aspectRatio(aspect);
  const padding = 3;
  const scale = Math.min(
    (boxWidth - padding * 2) / w,
    (boxHeight - padding * 2) / h,
  );
  const width = w * scale;
  const height = h * scale;
  const x = (boxWidth - width) / 2;
  const y = (boxHeight - height) / 2;

  return `<svg viewBox="0 0 ${boxWidth} ${boxHeight}" aria-hidden="true" focusable="false"><rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" rx="2" /></svg>`;
}

function aspectOrientation(aspect: Aspect): string {
  const { w, h } = aspectRatio(aspect);
  return w === h ? "Square" : w > h ? "Landscape" : "Portrait";
}

const STORAGE_KEY = "visual-prompt-studio.recipe.v2";

function loadSaved(): Recipe | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const res = parseRecipeJson(raw);
    return res.ok ? res.recipe : null;
  } catch {
    return null;
  }
}

function save(r: Recipe): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
  } catch {
    /* storage unavailable: the page still works, it just won't remember */
  }
}

/** Copy inside the click handler; fall back to selecting the text. */
async function copyText(
  text: string,
  fallbackEl: HTMLElement,
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const range = document.createRange();
    range.selectNodeContents(fallbackEl);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    }
  }
}

/* ── store ───────────────────────────────────────────────────────────── */

type Listener = (next: Recipe, prev: Recipe) => void;

class Store {
  #state: Recipe;
  #listeners = new Set<Listener>();
  constructor(initial: Recipe) {
    this.#state = initial;
  }
  get(): Recipe {
    return this.#state;
  }
  set(next: Recipe | ((r: Recipe) => Recipe)): void {
    const prev = this.#state;
    const value = typeof next === "function" ? next(prev) : next;
    if (value === prev) return;
    this.#state = value;
    for (const l of this.#listeners) l(value, prev);
  }
  subscribe(l: Listener): void {
    this.#listeners.add(l);
  }
}

/* ── app ─────────────────────────────────────────────────────────────── */

interface View {
  layer: StyleLayer;
  baseline: boolean;
  refKind: ReferenceKind | "all";
  presetId: string | null;
  goal: GoalId;
  highlight: string | null;
}

export function startApp(): void {
  const store = new Store(loadSaved() ?? DEFAULT_RECIPE);
  const view: View = {
    layer: "design",
    baseline: false,
    refKind: "all",
    presetId: null,
    goal: "attention",
    highlight: null,
  };
  let compiled: CompiledPrompt = compile(store.get());
  let frame = 0;

  const status = $("status");
  let statusTimer = 0;
  function say(message: string, undo?: () => void): void {
    window.clearTimeout(statusTimer);
    status.innerHTML = esc(message);
    if (undo) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "link";
      b.textContent = "Undo";
      b.style.marginLeft = "8px";
      b.addEventListener("click", () => {
        undo();
        say("Restored.");
      });
      status.append(b);
    }
    statusTimer = window.setTimeout(
      () => (status.textContent = ""),
      undo ? 9000 : 3500,
    );
  }

  const patch = (p: Partial<Recipe>): void =>
    store.set((r) => ({ ...r, ...p }));

  /* ── brief ── */
  const idea = $<HTMLTextAreaElement>("f-idea");
  const headline = $<HTMLInputElement>("f-headline");
  const extra = $<HTMLTextAreaElement>("f-extra");
  const detail = $<HTMLInputElement>("f-detail");
  const purpose = $<HTMLSelectElement>("f-purpose");
  const goalPicker = $<HTMLSelectElement>("f-goal");
  const aspectPicker = $("f-aspect");

  purpose.innerHTML = PURPOSES.map(
    (p) => `<option value="${p.id}">${esc(p.label)}</option>`,
  ).join("");
  goalPicker.innerHTML = GOALS.map(
    (goal) => `<option value="${goal.id}">${esc(goal.label)}</option>`,
  ).join("");
  function renderAspectOptions(r: Recipe): void {
    const options: { aspect: Aspect; custom: boolean }[] = DEFAULT_ASPECTS.map(
      (aspect) => ({ aspect, custom: false }),
    );

    for (const aspect of r.customAspects) {
      const existing = options.find((option) => option.aspect === aspect);
      if (existing) {
        existing.custom = true;
      } else {
        options.push({ aspect, custom: true });
      }
    }
    if (!options.some((option) => option.aspect === r.aspect)) {
      options.push({ aspect: r.aspect, custom: !isAspectPreset(r.aspect) });
    }

    const key = `${options.map(({ aspect, custom }) => `${aspect}:${custom}`).join("|")}:${r.customAspects.length}`;
    if (key === aspectOptionsKey) return;
    aspectOptionsKey = key;

    const choiceMarkup = options
      .map(({ aspect, custom }) => {
        const label = isAspectPreset(aspect) ? ASPECT_LABELS[aspect] : "Custom";
        const option = `<label class="seg-option aspect-option"><input class="radio" type="radio" name="aspect" value="${esc(aspect)}" data-aspect="${esc(aspect)}" /><span class="aspect-shape">${aspectShapeSvg(aspect)}</span><span class="aspect-copy"><b>${esc(aspect)}</b><small>${esc(label)}</small></span></label>`;

        if (!custom) return option;
        return `<div class="aspect-custom-option">${option}<button type="button" class="btn btn-ghost btn-square btn-xs aspect-remove" data-remove-aspect="${esc(aspect)}" aria-label="Remove custom ratio ${esc(aspect)}" title="Remove ${esc(aspect)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"></path></svg></button></div>`;
      })
      .join("");

    aspectPicker.innerHTML = `${choiceMarkup}<button type="button" class="btn btn-ghost aspect-add" id="btn-add-aspect" aria-label="Add a custom aspect ratio" title="Add a custom aspect ratio"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg><span>Add</span></button>`;
    $("btn-add-aspect").toggleAttribute(
      "disabled",
      r.customAspects.length >= 12,
    );
  }

  let aspectOptionsKey = "";
  renderAspectOptions(store.get());

  idea.addEventListener("input", () =>
    patch({ idea: idea.value.slice(0, 400) }),
  );
  headline.addEventListener("input", () =>
    patch({ headline: headline.value.slice(0, 80) }),
  );
  detail.addEventListener("input", () =>
    patch({ detail: detail.value.slice(0, 240) }),
  );
  const extraLines = (v: string) =>
    v
      .split("\n")
      .map((l) => l.trim().slice(0, 80))
      .filter(Boolean)
      .slice(0, 4);
  extra.addEventListener("input", () =>
    patch({ extraText: extraLines(extra.value) }),
  );
  extra.addEventListener(
    "blur",
    () => (extra.value = store.get().extraText.join("\n")),
  );
  const aspectDialog = $<HTMLDialogElement>("dlg-aspect");
  const aspectForm = $<HTMLFormElement>("aspect-form");
  const aspectWidth = $<HTMLInputElement>("aspect-width");
  const aspectHeight = $<HTMLInputElement>("aspect-height");
  const aspectFrame = $("aspect-live-frame");
  const aspectLiveLabel = $("aspect-live-label");
  const aspectLiveOrientation = $("aspect-live-orientation");
  const aspectError = $("aspect-error");

  purpose.addEventListener("change", () => {
    const p = PURPOSES.find((x) => x.id === purpose.value);
    if (p) patch({ purpose: p.id, aspect: p.aspect });
  });
  goalPicker.addEventListener("change", () => {
    if (!GOALS.some((goal) => goal.id === goalPicker.value)) return;
    view.goal = goalPicker.value as GoalId;
    renderDirections(store.get());
  });
  aspectPicker.addEventListener("change", (e) => {
    const input = (e.target as HTMLElement).closest<HTMLInputElement>(
      "[data-aspect]",
    );
    if (!input) return;
    const r = store.get();
    const selected =
      DEFAULT_ASPECTS.find((aspect) => aspect === input.value) ??
      r.customAspects.find((aspect) => aspect === input.value);
    if (selected) patch({ aspect: selected });
  });
  aspectPicker.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "button",
    );
    if (!target) return;

    if (target.id === "btn-add-aspect") {
      const { w, h } = aspectRatio(store.get().aspect);
      aspectWidth.value = String(w);
      aspectHeight.value = String(h);
      updateAspectPreview();
      aspectDialog.showModal();
      return;
    }

    const value = target.dataset.removeAspect;
    if (!value) return;
    const r = store.get();
    const isSaved = r.customAspects.some((aspect) => aspect === value);
    const isCurrent = r.aspect === value;
    if (!isSaved && !isCurrent) return;

    store.set({
      ...r,
      aspect: isCurrent ? DEFAULT_ASPECTS[0] : r.aspect,
      customAspects: r.customAspects.filter((aspect) => aspect !== value),
    });
    say(`Removed ${value}.`);
  });

  function updateAspectPreview(): void {
    const ratio = customAspectFromDimensions(
      Number(aspectWidth.value),
      Number(aspectHeight.value),
    );
    if (!ratio) {
      aspectFrame.innerHTML = "";
      aspectLiveLabel.textContent = "—";
      aspectLiveOrientation.textContent = "Use whole numbers from 1 to 100";
      aspectError.hidden = true;
      return;
    }

    aspectFrame.innerHTML = aspectShapeSvg(ratio, 88, 64);
    aspectFrame.setAttribute(
      "aria-label",
      `${ratio} ${aspectOrientation(ratio).toLowerCase()} frame preview`,
    );
    aspectLiveLabel.textContent = ratio;
    aspectLiveOrientation.textContent = aspectOrientation(ratio);
    aspectError.hidden = true;
  }

  aspectWidth.addEventListener("input", updateAspectPreview);
  aspectHeight.addEventListener("input", updateAspectPreview);
  $("aspect-cancel").addEventListener("click", () => aspectDialog.close());
  aspectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const aspect = customAspectFromDimensions(
      Number(aspectWidth.value),
      Number(aspectHeight.value),
    );
    if (!aspect) {
      aspectError.textContent =
        "Use whole numbers from 1 to 100 for both sides.";
      aspectError.hidden = false;
      return;
    }

    const r = store.get();
    const isPreset = isAspectPreset(aspect);
    const isSaved = r.customAspects.some((ratio) => ratio === aspect);
    if (!isPreset && !isSaved && r.customAspects.length >= 12) {
      aspectError.textContent =
        "Remove a saved custom ratio before adding another.";
      aspectError.hidden = false;
      return;
    }

    store.set({
      ...r,
      aspect,
      customAspects:
        isPreset || isSaved ? r.customAspects : [...r.customAspects, aspect],
    });
    aspectDialog.close();
    say(`Using ${aspect}.`);
  });
  document
    .querySelectorAll<HTMLInputElement>("[data-textmode]")
    .forEach((input) =>
      input.addEventListener("change", () => {
        if (
          input.checked &&
          (input.value === "render" || input.value === "space")
        ) {
          patch({ textMode: input.value });
        }
      }),
    );

  /* ── quick starts ── */
  const presetsEl = $("presets");
  const directionResults = $("direction-results");
  const directionSearch = $<HTMLInputElement>("direction-search");
  const directionFormat = $<HTMLSelectElement>("direction-format");
  const directionGoal = $<HTMLSelectElement>("direction-goal");
  const directionStyle = $<HTMLSelectElement>("direction-style");
  const directionGroup = $<HTMLSelectElement>("direction-group");
  const curatedOnly = $<HTMLInputElement>("direction-curated");
  const trendOnly = $<HTMLInputElement>("direction-2026");
  const directionActiveFilters = $("direction-active-filters");
  const directionPagination = $("direction-pagination");
  let directionPage = 1;
  function renderDirections(recipe: Recipe): void {
    const goal = GOALS.find((item) => item.id === view.goal)!;
    const directions = getRecommendations(recipe.purpose, view.goal, 4);
    $("goal-guidance").textContent = goal.description;
    $("direction-count").textContent =
      `${directions.length} suggested directions`;
    presetsEl.innerHTML = directions
      .map((direction) =>
        renderDirectionCard(direction, {
          variant: "suggested",
          goal: view.goal,
          selected: view.presetId === direction.id,
        }),
      )
      .join("");
  }
  renderDirections(store.get());
  directionFormat.innerHTML = `<option value="all">All project types</option>${PURPOSES.map((item) => `<option value="${item.id}">${esc(item.label)}</option>`).join("")}`;
  directionGoal.innerHTML = `<option value="all">All goals</option>${GOALS.map((item) => `<option value="${item.id}">${esc(item.label)}</option>`).join("")}`;
  const styleOptions = (
    [
      ["design", "Layout"],
      ["art", "Imagery"],
      ["technique", "Finish"],
    ] as const
  )
    .map(
      ([layer, label]) =>
        `<optgroup label="${label}">${stylesOf(layer)
          .map(
            (style) =>
              `<option value="${style.id}">${esc(style.name)}</option>`,
          )
          .join("")}</optgroup>`,
    )
    .join("");
  directionStyle.innerHTML = `<option value="all">All styles</option>${styleOptions}`;

  function applyChosenDirection(
    id: string | undefined,
    origin?: HTMLElement,
  ): void {
    const direction = PRESETS.find((item) => item.id === id);
    if (!direction) return;
    const before = store.get();
    view.presetId = direction.id;
    store.set(applyDirection(before, direction));
    // Applying a direction rebuilds both result lists. Return keyboard focus to
    // the activated control after the store's scheduled render replaces it.
    requestAnimationFrame(() => {
      const replacement = [
        ...(origin?.querySelectorAll<HTMLButtonElement>("[data-preset]") ?? []),
      ].find((button) => button.dataset.preset === direction.id);
      replacement?.focus();
    });
    say(
      direction.trendYear === 2026
        ? `Applied “${direction.name}” visual starter. Your content and output settings are unchanged.`
        : `Applied “${direction.name}”. Your brief and output settings are unchanged.`,
      () => store.set(before),
    );
  }
  presetsEl.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-preset]",
    );
    if (button) applyChosenDirection(button.dataset.preset, presetsEl);
  });

  function renderDirectionExplorer(): void {
    const filters: DirectionFilters = {
      query: directionSearch.value,
      format: directionFormat.value as DirectionFilters["format"],
      goal: directionGoal.value as DirectionFilters["goal"],
      styleId: directionStyle.value,
      curatedOnly: curatedOnly.checked,
      trendYear: trendOnly.checked ? 2026 : "all",
    };
    directionActiveFilters.innerHTML = renderFilterSummary("directions", [
      ...(directionSearch.value.trim()
        ? [
            {
              key: "query",
              label: "Search",
              value: directionSearch.value.trim(),
            },
          ]
        : []),
      ...(directionFormat.value !== "all"
        ? [
            {
              key: "format",
              label: "Project type",
              value:
                directionFormat.selectedOptions[0]?.textContent?.trim() ?? "",
            },
          ]
        : []),
      ...(directionGoal.value !== "all"
        ? [
            {
              key: "goal",
              label: "Communication goal",
              value:
                directionGoal.selectedOptions[0]?.textContent?.trim() ?? "",
            },
          ]
        : []),
      ...(directionStyle.value !== "all"
        ? [
            {
              key: "styleId",
              label: "Style layer",
              value: getStyle(directionStyle.value as StyleId).name,
            },
          ]
        : []),
      ...(curatedOnly.checked
        ? [{ key: "curatedOnly", label: "Curated picks", value: "Only" }]
        : []),
      ...(trendOnly.checked
        ? [{ key: "trendYear", label: "Edition", value: "2026 starters" }]
        : []),
    ]);
    const filtered = filterDirections(PRESETS, filters).toSorted(
      (a, b) =>
        (a.curatedRank ?? Number.MAX_SAFE_INTEGER) -
          (b.curatedRank ?? Number.MAX_SAFE_INTEGER) ||
        a.name.localeCompare(b.name),
    );
    const page = paginateItems(filtered, directionPage, 6);
    directionPage = page.page;
    const by = directionGroup.value;
    const groupFor = (direction: (typeof PRESETS)[number]): string => {
      if (by === "goal") {
        const selectedGoal = directionGoal.value as GoalId | "all";
        const primaryGoal = direction.goals[0];
        const goal = GOALS.find(
          (item) =>
            item.id === (selectedGoal === "all" ? primaryGoal : selectedGoal),
        );
        return goal?.label ?? "Other goals";
      }
      const selectedFormat = directionFormat.value as PurposeId | "all";
      const primaryFormat = direction.formats[0];
      const purpose = PURPOSES.find(
        (item) =>
          item.id ===
          (selectedFormat === "all" ? primaryFormat : selectedFormat),
      );
      return purpose?.label ?? "Other project types";
    };
    const groups = Map.groupBy(page.items, groupFor);
    const groupsMarkup = [...groups]
      .map(
        ([
          group,
          items,
        ]) => `<section class="direction-result-group" aria-label="${esc(group)} directions">
        <h3>${esc(group)}</h3>
        ${items
          .map((direction) =>
            renderDirectionCard(direction, {
              variant: "explorer",
              goal:
                directionGoal.value === "all"
                  ? direction.goals[0]!
                  : (directionGoal.value as GoalId),
              selected: view.presetId === direction.id,
            }),
          )
          .join("")}
      </section>`,
      )
      .join("");
    directionResults.innerHTML = page.total
      ? groupsMarkup
      : `<div class="empty-directions"><p>No directions match these filters.</p><button type="button" class="btn btn-ghost btn-sm" data-clear-direction-search>Clear search and filters</button></div>`;
    $("explorer-status").textContent =
      `${page.total} ${page.total === 1 ? "direction" : "directions"}${curatedOnly.checked ? " · studio-curated picks" : ""}${trendOnly.checked ? " · 2026 starters" : ""}`;
    directionPagination.innerHTML =
      page.pageCount > 1
        ? `<div class="join"><button class="btn btn-sm join-item" type="button" data-page="${page.page - 1}" ${page.page === 1 ? "disabled" : ""} aria-label="Previous page">Previous</button><span class="btn btn-sm join-item pagination-current" aria-current="page">Page ${page.page} of ${page.pageCount}</span><button class="btn btn-sm join-item" type="button" data-page="${page.page + 1}" ${page.page === page.pageCount ? "disabled" : ""} aria-label="Next page">Next</button></div>`
        : "";
  }
  renderDirectionExplorer();
  directionSearch.addEventListener("input", () => {
    directionPage = 1;
    renderDirectionExplorer();
  });
  [
    directionFormat,
    directionGoal,
    directionStyle,
    directionGroup,
    curatedOnly,
    trendOnly,
  ].forEach((input) =>
    input.addEventListener("change", () => {
      directionPage = 1;
      renderDirectionExplorer();
    }),
  );
  directionResults.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-clear-direction-search]")) {
      directionSearch.value = "";
      directionFormat.value = "all";
      directionGoal.value = "all";
      directionStyle.value = "all";
      curatedOnly.checked = false;
      trendOnly.checked = false;
      directionPage = 1;
      renderDirectionExplorer();
      directionSearch.focus();
      return;
    }
    const button = target.closest<HTMLButtonElement>("[data-preset]");
    if (button) applyChosenDirection(button.dataset.preset, directionResults);
  });
  directionActiveFilters.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const remove = target.closest<HTMLButtonElement>("[data-remove-filter]");
    const area = target.closest<HTMLButtonElement>("[data-clear-filter-area]");
    if (!remove && area?.dataset.clearFilterArea !== "directions") return;
    const focusIds: Record<string, string> = {
      query: "direction-search",
      format: "direction-format",
      goal: "direction-goal",
      styleId: "direction-style",
      curatedOnly: "direction-curated",
      trendYear: "direction-2026",
    };
    if (remove) {
      const focusId = focusIds[remove.dataset.removeFilter ?? ""];
      if (!focusId) return;
      if (focusId === "direction-search") directionSearch.value = "";
      if (focusId === "direction-format") directionFormat.value = "all";
      if (focusId === "direction-goal") directionGoal.value = "all";
      if (focusId === "direction-style") directionStyle.value = "all";
      if (focusId === "direction-curated") curatedOnly.checked = false;
      if (focusId === "direction-2026") trendOnly.checked = false;
      directionPage = 1;
      renderDirectionExplorer();
      requestAnimationFrame(() => $(focusId).focus());
      return;
    }
    directionSearch.value = "";
    directionFormat.value = "all";
    directionGoal.value = "all";
    directionStyle.value = "all";
    curatedOnly.checked = false;
    trendOnly.checked = false;
    directionPage = 1;
    renderDirectionExplorer();
    requestAnimationFrame(() => directionSearch.focus());
  });
  directionPagination.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-page]",
    );
    if (!button || button.disabled) return;
    directionPage = Number(button.dataset.page);
    renderDirectionExplorer();
    directionResults.focus();
  });

  /* ── style tiles ── */
  const tabs =
    document.querySelectorAll<HTMLButtonElement>('.tabs [role="tab"]');
  const panels: Record<StyleLayer, HTMLElement> = {
    design: $("styles-design-grid"),
    art: $("styles-art-grid"),
    technique: $("styles-technique-grid"),
  };
  const styleBrowsePage: Record<StyleLayer, number> = {
    design: 1,
    art: 1,
    technique: 1,
  };
  const styleRenderKey: Record<StyleLayer, string> = {
    design: "",
    art: "",
    technique: "",
  };
  const styleRenderers: Record<StyleLayer, () => void> = {
    design: () => {},
    art: () => {},
    technique: () => {},
  };
  tabs.forEach((t) =>
    t.addEventListener("click", () => {
      view.layer = t.dataset.layer as StyleLayer;
      renderTabs();
    }),
  );
  // Arrow-key navigation between tabs.
  $("tab-design").parentElement!.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const order: StyleLayer[] = ["design", "art", "technique"];
    const i = order.indexOf(view.layer);
    view.layer = order[(i + (e.key === "ArrowRight" ? 1 : 2)) % 3]!;
    renderTabs();
    $(`tab-${view.layer}`).focus();
  });

  for (const layer of ["design", "art", "technique"] as const) {
    const styles = stylesOf(layer);
    const search = $<HTMLInputElement>(`style-search-${layer}`);
    const group = $<HTMLSelectElement>(`style-group-${layer}`);
    const curated = $<HTMLInputElement>(`style-curated-${layer}`);
    const activeFiltersEl = $(`style-active-filters-${layer}`);
    group.innerHTML = `<option value="all">All groups</option>${[...new Set(styles.map((style) => style.group))].map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join("")}`;

    function renderStyleLayer(): void {
      const filters: StyleFilters = {
        query: search.value,
        group: group.value,
        curatedOnly: curated.checked,
      };
      activeFiltersEl.innerHTML = renderFilterSummary(`style-${layer}`, [
        ...(search.value.trim()
          ? [{ key: "query", label: "Search", value: search.value.trim() }]
          : []),
        ...(group.value !== "all"
          ? [
              {
                key: "group",
                label: "Group",
                value: group.selectedOptions[0]?.textContent?.trim() ?? "",
              },
            ]
          : []),
        ...(curated.checked
          ? [{ key: "curatedOnly", label: "Curated picks", value: "Only" }]
          : []),
      ]);
      const filtered = filterStyles(styles, filters).toSorted(
        (a, b) => Number(b.curated) - Number(a.curated),
      );
      const page = paginateItems(filtered, styleBrowsePage[layer], 8);
      styleBrowsePage[layer] = page.page;
      const currentId = store.get().styles[layer];
      const recipe = store.get();
      const paletteKey =
        layer === "design"
          ? ""
          : JSON.stringify({
              palette: recipe.palette.map((color) => color.hex),
              design: recipe.styles.design,
              technique: recipe.styles.technique,
            });
      const renderKey = JSON.stringify([
        search.value,
        group.value,
        curated.checked,
        page.page,
        currentId,
        paletteKey,
      ]);
      if (styleRenderKey[layer] === renderKey) return;
      styleRenderKey[layer] = renderKey;
      const selectedStyle = getStyle(currentId);
      const currentVisible = page.items.some((style) => style.id === currentId);
      const selectedNote = $(`style-selected-${layer}`);
      selectedNote.innerHTML = currentVisible
        ? `<span>Current selection</span><strong>${esc(selectedStyle.name)}</strong>`
        : `<span>Current selection</span><strong>${esc(selectedStyle.name)}</strong><small>Outside these results. Clear a filter or use its page controls to find it.</small>`;
      $(`style-status-${layer}`).textContent =
        `${page.total} ${page.total === 1 ? "style" : "styles"}${curated.checked ? " · studio-curated picks" : ""}`;
      panels[layer].innerHTML = page.total
        ? page.items.map((style) => styleTileMarkup(layer, style)).join("")
        : `<div class="empty-directions"><p>No styles match these filters.</p><button type="button" class="btn btn-ghost btn-sm" data-clear-style-filters>Clear search and filters</button></div>`;
      panels[layer]
        .querySelectorAll<HTMLElement>("[data-style]")
        .forEach((button) =>
          button.setAttribute(
            "aria-pressed",
            String(button.dataset.style === currentId),
          ),
        );
      for (const style of page.items) {
        const target = panels[layer].querySelector<HTMLElement>(
          `[data-thumb="${style.id}"]`,
        );
        if (!target) continue;
        if (layer === "design") {
          const p = style.palette!;
          target.innerHTML = proofSvg({
            design: style.id as DesignId,
            art: "none",
            technique: "clean",
            inks: inksFrom([p[0].hex, p[1].hex, p[2].hex]),
            ratio: 11 / 16,
            headline: style.name.split(" ")[0]!.toUpperCase(),
            foot: [],
            fontCss: getFont(style.fontId ?? "inter")?.css ?? "sans-serif",
            condensed: style.fontId === "oswald" || style.fontId === "bebas",
            uid: `t-${style.id}`,
            label: `${style.name} layout sketch`,
          });
        } else if (layer === "art") {
          const palette = effectivePalette(recipe);
          target.innerHTML = motifSvg(
            style.id as ArtId,
            inksFrom([palette[0].hex, palette[1].hex, palette[2].hex]),
            `a-${style.id}`,
          );
        } else {
          const palette = effectivePalette({
            ...recipe,
            styles: { ...recipe.styles, technique: style.id as TechniqueId },
          });
          target.innerHTML = finishSvg(
            style.id as TechniqueId,
            inksFrom([palette[0].hex, palette[1].hex, palette[2].hex]),
            `f-${style.id}`,
          );
        }
      }
      const pagination = $(`style-pagination-${layer}`);
      pagination.innerHTML =
        page.pageCount > 1
          ? `<div class="join"><button class="btn btn-sm join-item" type="button" data-page="${page.page - 1}" ${page.page === 1 ? "disabled" : ""} aria-label="Previous page">Previous</button><span class="btn btn-sm join-item pagination-current" aria-current="page">Page ${page.page} of ${page.pageCount}</span><button class="btn btn-sm join-item" type="button" data-page="${page.page + 1}" ${page.page === page.pageCount ? "disabled" : ""} aria-label="Next page">Next</button></div>`
          : "";
    }
    styleRenderers[layer] = renderStyleLayer;

    function styleTileMarkup(
      styleLayer: StyleLayer,
      style: BrowsableStyle,
    ): string {
      const curatedBadge = style.curated
        ? '<span class="badge badge-outline style-curated-badge">Curated pick</span>'
        : "";
      const thumb = `<span class="art" data-thumb="${style.id}"></span>`;
      return `<button type="button" class="tile" data-layer="${styleLayer}" data-style="${style.id}" aria-pressed="false">
        ${thumb}
        <span class="meta"><span class="style-title-row"><b>${esc(style.name)}</b>${curatedBadge}</span><small>${esc(style.era)}</small><span>${esc(style.summary)}</span></span>
      </button>`;
    }

    search.addEventListener("input", () => {
      styleBrowsePage[layer] = 1;
      renderStyleLayer();
    });
    [group, curated].forEach((control) =>
      control.addEventListener("change", () => {
        styleBrowsePage[layer] = 1;
        renderStyleLayer();
      }),
    );
    activeFiltersEl.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const remove = target.closest<HTMLButtonElement>("[data-remove-filter]");
      const area = target.closest<HTMLButtonElement>(
        "[data-clear-filter-area]",
      );
      if (!remove && area?.dataset.clearFilterArea !== `style-${layer}`) return;
      if (remove) {
        switch (remove.dataset.removeFilter) {
          case "query":
            search.value = "";
            break;
          case "group":
            group.value = "all";
            break;
          case "curatedOnly":
            curated.checked = false;
            break;
          default:
            return;
        }
        styleBrowsePage[layer] = 1;
        styleRenderKey[layer] = "";
        renderStyleLayer();
        requestAnimationFrame(() => {
          const focusTarget =
            remove.dataset.removeFilter === "query"
              ? search
              : remove.dataset.removeFilter === "curatedOnly"
                ? curated
                : group;
          focusTarget.focus();
        });
        return;
      }
      search.value = "";
      group.value = "all";
      curated.checked = false;
      styleBrowsePage[layer] = 1;
      styleRenderKey[layer] = "";
      renderStyleLayer();
      requestAnimationFrame(() => search.focus());
    });
    panels[layer].addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-clear-style-filters]")) {
        search.value = "";
        group.value = "all";
        curated.checked = false;
        styleBrowsePage[layer] = 1;
        renderStyleLayer();
        search.focus();
        return;
      }
      const button = target.closest<HTMLButtonElement>("[data-style]");
      if (button) {
        const selectedId = button.dataset.style!;
        selectStyle(layer, selectedId);
        requestAnimationFrame(() => {
          const replacement = [
            ...panels[layer].querySelectorAll<HTMLButtonElement>(
              "[data-style]",
            ),
          ].find((tile) => tile.dataset.style === selectedId);
          replacement?.focus();
        });
      }
    });
    panels[layer].tabIndex = -1;
    $(`style-pagination-${layer}`).addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-page]",
      );
      if (!button || button.disabled) return;
      styleBrowsePage[layer] = Number(button.dataset.page);
      renderStyleLayer();
      panels[layer].focus();
    });
    renderStyleLayer();
  }

  function selectStyle(layer: StyleLayer, id: string): void {
    store.set((r) => {
      const styles = { ...r.styles, [layer]: id } as Recipe["styles"];
      let palette = r.palette;
      // Follow the new movement's palette unless the user customized the old one.
      if (layer === "design") {
        const prev = getStyle(r.styles.design).palette;
        const next = getStyle(id as DesignId).palette;
        const untouched =
          prev &&
          prev.every(
            (c, i) => c.hex.toLowerCase() === r.palette[i]?.hex.toLowerCase(),
          );
        if (next && untouched) palette = clonePalette(next);
      }
      return { ...r, styles, palette };
    });
  }

  $("mixes").innerHTML = MIXES.map(
    (m, i) =>
      `<button type="button" class="mix" data-mix="${i}" title="${esc(m.expect)}">${esc(m.name)}</button>`,
  ).join("");
  $("mixes").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-mix]",
    );
    const mix = b ? MIXES[Number(b.dataset.mix)] : undefined;
    if (!mix) return;
    patch({ styles: { ...mix.styles } });
    say(`${mix.name}: ${mix.expect}`);
  });
  $("btn-shuffle").addEventListener("click", () => {
    const pick = <T extends string>(ids: readonly T[], not: T): T => {
      const pool = ids.filter((x) => x !== not);
      return pool[Math.floor(Math.random() * pool.length)] ?? not;
    };
    const r = store.get();
    const design = pick(
      stylesOf("design").map((s) => s.id as DesignId),
      r.styles.design,
    );
    const art = pick(
      stylesOf("art")
        .map((s) => s.id as ArtId)
        .filter((x) => x !== "none"),
      r.styles.art,
    );
    const technique = pick(
      stylesOf("technique").map((s) => s.id as TechniqueId),
      r.styles.technique,
    );
    patch({ styles: { design, art, technique } });
    say(
      `Shuffled: ${getStyle(design).name} × ${getStyle(art).name} × ${getStyle(technique).name}.`,
    );
  });

  /* ── palette ── */
  const swatchesEl = $("swatches");
  const roles = ["Ground", "Ink A", "Ink B"] as const;
  swatchesEl.innerHTML = roles
    .map(
      (role, i) =>
        `<div class="swatch"><label title="${role}"><input type="color" id="sw-${i}" aria-label="${role} color"/></label><span class="nm" id="sw-nm-${i}"></span><span class="hx" id="sw-hx-${i}"></span></div>`,
    )
    .join("");
  roles.forEach((_, i) => {
    const input = $<HTMLInputElement>(`sw-${i}`);
    input.addEventListener("input", () => {
      store.set((r) => {
        const palette = clonePaletteValue(r.palette);
        palette[i] = {
          hex: input.value.toUpperCase(),
          name: nameForHex(input.value),
        };
        return { ...r, palette };
      });
    });
  });
  const variationsEl = $("variations");
  function renderVariations(r: Recipe): void {
    const own = getStyle(r.styles.design).palette;
    const options = [
      ...(own
        ? [{ id: "style", label: "Style default", colors: clonePalette(own) }]
        : []),
      ...PALETTE_VARIATIONS,
    ];
    const current = r.palette.map((c) => c.hex.toLowerCase()).join();
    variationsEl.innerHTML = options
      .map(
        (v) =>
          `<button type="button" class="var" data-var="${v.id}" aria-pressed="${v.colors.map((c) => c.hex.toLowerCase()).join() === current}">
            <span class="strip">${v.colors.map((c) => `<i style="background:${c.hex}"></i>`).join("")}</span>${esc(v.label)}</button>`,
      )
      .join("");
    variationsEl.onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-var]",
      );
      const v = options.find((o) => o.id === b?.dataset.var);
      if (v) patch({ palette: clonePaletteValue(v.colors) });
    };
  }

  /* ── typography ── */
  const specimensEl = $("specimens");
  const fontOptionsEl = $("font-options");
  const fontSearchEl = $<HTMLInputElement>("font-search");
  const fontDialog = $<HTMLDialogElement>("font-picker-dialog");
  const fontTrigger = $<HTMLButtonElement>("font-picker-trigger");
  const fontActiveFilters = $("font-active-filters");
  let fontCategoryFilter = "all";

  const categoryName: Record<(typeof FONTS)[number]["category"], string> = {
    sans: "Sans serif",
    serif: "Serif",
    display: "Display",
    mono: "Monospaced",
  };
  const fontFilterLabels: Record<string, string> = {
    popular: "Popular",
    sans: categoryName.sans,
    serif: categoryName.serif,
    display: categoryName.display,
    mono: categoryName.mono,
  };

  function renderFontOptions(): void {
    const query = fontSearchEl.value.trim().toLocaleLowerCase();
    fontActiveFilters.innerHTML = renderFilterSummary("fonts", [
      ...(fontSearchEl.value.trim()
        ? [{ key: "query", label: "Search", value: fontSearchEl.value.trim() }]
        : []),
      ...(fontCategoryFilter !== "all"
        ? [
            {
              key: "category",
              label: "Category",
              value: fontFilterLabels[fontCategoryFilter] ?? fontCategoryFilter,
            },
          ]
        : []),
    ]);
    const fonts = FONTS.filter((font) => {
      const matchesCategory =
        fontCategoryFilter === "all" ||
        (fontCategoryFilter === "popular"
          ? font.popular
          : font.category === fontCategoryFilter);
      const matchesQuery =
        `${font.family} ${font.classification} ${categoryName[font.category]}`
          .toLocaleLowerCase()
          .includes(query);
      return matchesCategory && matchesQuery;
    });

    fontOptionsEl.innerHTML = fonts
      .map(
        (font) =>
          `<button type="button" class="spec" data-font="${font.id}" aria-pressed="false"><span class="sample" style="font-family:${esc(font.css)};font-weight:${font.weights.at(-1)}" data-sample></span><span class="foot"><b>${esc(font.family)}${font.popular ? '<span class="font-popular">Popular</span>' : ""}</b><span>${esc(categoryName[font.category])} · ${esc(font.classification)}</span></span></button>`,
      )
      .join("");
    $("font-result-count").textContent =
      `${fonts.length} ${fonts.length === 1 ? "font" : "fonts"}`;
    $("font-empty").hidden = fonts.length > 0;
    $("font-options").hidden = fonts.length === 0;

    specimensEl
      .querySelectorAll<HTMLElement>("[data-sample]")
      .forEach(
        (el) =>
          (el.textContent = store.get().headline.trim() || "Objects in motion"),
      );
  }

  function setFontCategoryFilter(category: string): void {
    fontCategoryFilter = category;
    specimensEl
      .querySelectorAll<HTMLButtonElement>("[data-font-category]")
      .forEach((button) => {
        const selected = button.dataset.fontCategory === fontCategoryFilter;
        button.setAttribute("aria-pressed", String(selected));
        button.classList.toggle("btn-ghost", !selected);
      });
    renderFontOptions();
  }

  renderFontOptions();
  fontTrigger.addEventListener("click", () => {
    if (!fontDialog.open) fontDialog.showModal();
    requestAnimationFrame(() => fontSearchEl.focus());
  });
  fontDialog.addEventListener("close", () => fontTrigger.focus());
  fontSearchEl.addEventListener("input", renderFontOptions);
  fontActiveFilters.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const remove = target.closest<HTMLButtonElement>("[data-remove-filter]");
    const area = target.closest<HTMLButtonElement>("[data-clear-filter-area]");
    if (!remove && area?.dataset.clearFilterArea !== "fonts") return;
    if (remove?.dataset.removeFilter === "query") {
      fontSearchEl.value = "";
      renderFontOptions();
      requestAnimationFrame(() => fontSearchEl.focus());
      return;
    }
    if (remove?.dataset.removeFilter === "category") {
      setFontCategoryFilter("all");
      requestAnimationFrame(() => {
        specimensEl
          .querySelector<HTMLButtonElement>('[data-font-category="all"]')
          ?.focus();
      });
      return;
    }
    if (remove) return;
    fontSearchEl.value = "";
    setFontCategoryFilter("all");
    requestAnimationFrame(() => fontSearchEl.focus());
  });
  specimensEl.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const category = target.closest<HTMLButtonElement>("[data-font-category]");
    if (category) {
      setFontCategoryFilter(category.dataset.fontCategory ?? "all");
      return;
    }

    if (target.closest("[data-font-clear]")) {
      fontSearchEl.value = "";
      renderFontOptions();
      fontSearchEl.focus();
      return;
    }

    const weight = target.closest<HTMLButtonElement>("[data-font-weight]");
    if (weight) {
      patch({ fontWeight: weight.dataset.fontWeight as Recipe["fontWeight"] });
      return;
    }

    if (target.closest("[data-font-italic]")) {
      const current = store.get();
      const font = current.font === "style" ? undefined : getFont(current.font);
      if (!font || font.italic) patch({ fontItalic: !current.fontItalic });
      return;
    }

    const button = target.closest<HTMLButtonElement>("[data-font]");
    if (button) {
      const fontId = button.dataset.font as "style" | FontId;
      const font = fontId === "style" ? undefined : getFont(fontId);
      const current = store.get();
      patch({
        font: fontId,
        fontWeight:
          current.fontWeight === "bold" &&
          font &&
          !font.weights.some((weight) => weight >= 700)
            ? "regular"
            : current.fontWeight,
        fontItalic: current.fontItalic && (font?.italic ?? true),
      });
    }
  });

  /* ── exclusions ── */
  const cliche = $<HTMLSelectElement>("f-cliche");
  cliche.innerHTML = CLICHES.map(
    (c) => `<option value="${c.id}">${esc(c.label)}</option>`,
  ).join("");
  cliche.addEventListener("change", () =>
    patch({ cliche: cliche.value as ClicheId }),
  );
  const groupLabels: Record<AvoidGroup, string> = {
    "ai-look": "Default AI embellishments",
    text: "Text",
    finish: "Surface",
  };
  $("avoids").innerHTML = (Object.keys(groupLabels) as AvoidGroup[])
    .map(
      (g) =>
        `<div class="chip-group"><h3>${groupLabels[g]}</h3><div class="chips">${AVOIDS.filter(
          (a) => a.group === g,
        )
          .map(
            (a) =>
              `<button type="button" class="chip" data-avoid="${a.id}" aria-pressed="false"><span>${esc(a.label)}</span><span class="why"></span></button>`,
          )
          .join("")}</div></div>`,
    )
    .join("");
  $("avoids").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-avoid]",
    );
    if (!b) return;
    const id = b.dataset.avoid as AvoidId;
    store.set((r) => ({
      ...r,
      avoids: r.avoids.includes(id)
        ? r.avoids.filter((x) => x !== id)
        : [...r.avoids, id],
    }));
  });
  $("avoid-defaults").addEventListener("click", () =>
    patch({ avoids: [...DEFAULT_AVOIDS] }),
  );
  $("avoid-clear").addEventListener("click", () => patch({ avoids: [] }));

  /* ── signatures ── */
  $("signatures").innerHTML = SIGNATURES.map(
    (s) =>
      `<button type="button" class="sig" data-sig="${s.id}" aria-pressed="false"><b>${esc(s.label)}</b><span>${esc(s.hint)}</span></button>`,
  ).join("");
  $("signatures").addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-sig]",
    );
    if (!b) return;
    const id = b.dataset.sig as SignatureId;
    store.set((r) => ({
      ...r,
      signatures: r.signatures.includes(id)
        ? r.signatures.filter((x) => x !== id)
        : [...r.signatures, id],
    }));
  });

  /* ── target & pattern ── */
  $("f-target").innerHTML = TARGETS.map(
    (t) =>
      `<label class="seg-option"><input class="radio" type="radio" name="target" value="${t.id}" data-target="${t.id}" /><span title="${esc(t.model)}">${esc(t.label)}</span></label>`,
  ).join("");
  $("f-target").addEventListener("change", (e) => {
    const input = (e.target as HTMLElement).closest<HTMLInputElement>(
      "[data-target]",
    );
    if (input && TARGETS.some((target) => target.id === input.value)) {
      patch({ target: input.value as TargetId });
    }
  });
  const pattern = $<HTMLSelectElement>("f-pattern");
  pattern.addEventListener("change", () =>
    patch({ pattern: pattern.value as PatternId }),
  );
  document.querySelectorAll<HTMLInputElement>("[data-lang]").forEach((input) =>
    input.addEventListener("change", () => {
      if (input.checked && (input.value === "en" || input.value === "es")) {
        patch({ language: input.value });
      }
    }),
  );
  const change = $<HTMLInputElement>("f-change");
  const preserve = $<HTMLInputElement>("f-preserve");
  change.addEventListener("input", () =>
    store.set((r) => ({
      ...r,
      edit: { ...r.edit, change: change.value.slice(0, 240) },
    })),
  );
  preserve.addEventListener("input", () =>
    store.set((r) => ({
      ...r,
      edit: { ...r.edit, preserve: preserve.value.slice(0, 240) },
    })),
  );

  const sref = $<HTMLInputElement>("f-sref");
  const srefError = $("sref-error");
  sref.addEventListener("input", () => {
    const tokens = sref.value.split(/\s+/).filter(Boolean).slice(0, 5);
    const candidate = {
      ...store.get(),
      midjourney: { ...store.get().midjourney, sref: tokens },
    };
    const res = parseRecipe(candidate);
    srefError.hidden = res.ok;
    if (res.ok) store.set(candidate);
    else
      srefError.textContent =
        "Use codes (letters and digits) or https image URLs, separated by spaces.";
  });
  const raw = $<HTMLInputElement>("f-raw");
  raw.addEventListener("change", () =>
    store.set((r) => ({
      ...r,
      midjourney: { ...r.midjourney, raw: raw.checked },
    })),
  );
  const stylize = $<HTMLInputElement>("f-stylize");
  stylize.addEventListener("input", () => {
    const v =
      stylize.value === ""
        ? null
        : Math.max(0, Math.min(1000, Math.round(Number(stylize.value))));
    store.set((r) => ({
      ...r,
      midjourney: { ...r.midjourney, stylize: Number.isFinite(v) ? v : null },
    }));
  });

  /* ── prompt & copy ── */
  const promptEl = $("prompt");
  const negEl = $("neg");
  const copyIcon = $("btn-copy-icon");
  const copyIconHtml = copyIcon.innerHTML;
  let copyIconTimer = 0;
  async function copyPrompt(): Promise<void> {
    const ok = await copyText(compiled.text, promptEl);
    if (!ok) promptEl.closest("details")?.setAttribute("open", "");
    if (ok) {
      copyIcon.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12 5 5 9-10"></path></svg>';
      window.clearTimeout(copyIconTimer);
      copyIconTimer = window.setTimeout(() => {
        copyIcon.innerHTML = copyIconHtml;
      }, 1500);
    }
    say(
      ok
        ? `Copied ${compiled.text.length.toLocaleString()} characters.`
        : "Copy was blocked. The prompt is selected: press Ctrl+C or ⌘C.",
    );
  }
  $("btn-copy").addEventListener("click", () => void copyPrompt());
  $("btn-copy-mobile").addEventListener("click", () => void copyPrompt());
  copyIcon.addEventListener("click", () => void copyPrompt());
  $("btn-copy").title = "Ctrl+Enter or ⌘+Enter";
  $("btn-copy-neg").addEventListener("click", async () => {
    const ok = await copyText(compiled.negativeText ?? "", negEl);
    say(
      ok
        ? "Copied the negative prompt."
        : "Copy was blocked. The text is selected: press Ctrl+C or ⌘C.",
    );
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void copyPrompt();
    }
  });
  $("btn-baseline").addEventListener("click", () => {
    view.baseline = !view.baseline;
    schedule();
  });

  // Hovering a separation in the legend highlights the words it produced.
  $("seps").addEventListener("mouseover", (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>("[data-src]");
    view.highlight = li?.dataset.src ?? null;
    promptEl.className = `prompt${view.highlight ? ` hl-${view.highlight}` : ""}`;
  });
  $("seps").addEventListener("mouseleave", () => {
    view.highlight = null;
    promptEl.className = "prompt";
  });

  /* ── import / export / reset ── */
  const dlgExport = $<HTMLDialogElement>("dlg-export");
  const expJson = $<HTMLTextAreaElement>("exp-json");
  $("btn-export").addEventListener("click", () => {
    expJson.value = JSON.stringify(store.get(), null, 2);
    dlgExport.showModal();
  });
  $("exp-copy").addEventListener("click", async () => {
    const ok = await copyText(expJson.value, expJson);
    if (!ok) expJson.select();
    $("exp-copy").textContent = ok ? "Copied" : "Press Ctrl+C";
    window.setTimeout(() => ($("exp-copy").textContent = "Copy JSON"), 2000);
  });
  const dl = $("exp-download");
  dl.hidden = false;
  dl.addEventListener("click", () => {
    const blob = new Blob([expJson.value], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "visual-prompt-recipe.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  const dlgImport = $<HTMLDialogElement>("dlg-import");
  const impJson = $<HTMLTextAreaElement>("imp-json");
  const impIssues = $("imp-issues");
  $("btn-import").addEventListener("click", () => {
    impIssues.hidden = true;
    dlgImport.showModal();
  });
  $<HTMLInputElement>("imp-file").addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (impJson.value = String(reader.result ?? ""));
    reader.readAsText(file);
  });
  $("imp-apply").addEventListener("click", () => {
    const res = parseRecipeJson(impJson.value);
    if (!res.ok) {
      impIssues.hidden = false;
      impIssues.innerHTML = res.issues
        .slice(0, 8)
        .map((i) => `<li>${esc(i)}</li>`)
        .join("");
      return;
    }
    const before = store.get();
    store.set(res.recipe);
    dlgImport.close();
    say("Recipe imported.", () => store.set(before));
  });
  $("btn-reset").addEventListener("click", () => {
    const before = store.get();
    view.presetId = null;
    store.set(DEFAULT_RECIPE);
    say("Reset to the example brief.", () => store.set(before));
  });

  /* ── inspiration ── */
  const kinds = [...new Set(REFERENCES.map((r) => r.kind))];
  const filtersEl = $("ref-filters");
  const refActiveFilters = $("ref-active-filters");
  filtersEl.innerHTML = [
    `<button type="button" class="chip" data-kind="all">All</button>`,
  ]
    .concat(
      kinds.map(
        (k) =>
          `<button type="button" class="chip" data-kind="${k}">${KIND_LABELS[k]}</button>`,
      ),
    )
    .join("");
  filtersEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-kind]",
    );
    if (!b) return;
    view.refKind = b.dataset.kind as View["refKind"];
    renderRefs(store.get());
  });
  refActiveFilters.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const remove = target.closest<HTMLButtonElement>("[data-remove-filter]");
    const area = target.closest<HTMLButtonElement>("[data-clear-filter-area]");
    if (!remove && area?.dataset.clearFilterArea !== "inspiration") return;
    if (remove && remove.dataset.removeFilter !== "kind") return;
    view.refKind = "all";
    renderRefs(store.get());
    requestAnimationFrame(() => {
      filtersEl.querySelector<HTMLButtonElement>('[data-kind="all"]')?.focus();
    });
  });
  const fmtDate = (iso: string) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const statusLabel = {
    active: "Active",
    dormant: "Looks dormant",
    pivoted: "Pivoted",
  } as const;
  const costLabel = {
    free: "Free",
    freemium: "Free + paid tier",
    paid: "Paid",
  } as const;
  function renderRefs(r: Recipe): void {
    filtersEl
      .querySelectorAll<HTMLButtonElement>("[data-kind]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.kind === view.refKind)),
      );
    refActiveFilters.innerHTML = renderFilterSummary(
      "inspiration",
      view.refKind === "all"
        ? []
        : [
            {
              key: "kind",
              label: "Source type",
              value: KIND_LABELS[view.refKind],
            },
          ],
    );
    const names = [
      r.styles.art !== "none" ? getStyle(r.styles.art).name : null,
      getStyle(r.styles.design).name,
      getStyle(r.styles.technique).name,
    ].filter((x): x is string => x !== null);
    const references = REFERENCES.filter(
      (x) => view.refKind === "all" || x.kind === view.refKind,
    );
    $("ref-filter-status").textContent =
      `${references.length} ${references.length === 1 ? "source" : "sources"}${view.refKind === "all" ? "" : ` · ${KIND_LABELS[view.refKind]}`}`;
    $("refs").innerHTML = references
      .map((x) => {
        const deep = x.deepLink?.({ styleNames: names, target: r.target });
        return `<article class="ref">
          <div class="ref-top"><h3><a href="${x.url}" target="_blank" rel="noopener noreferrer">${esc(x.name)}</a></h3><span class="kind">${KIND_LABELS[x.kind]}</span></div>
          <p class="best">${esc(x.bestFor)}</p>
          <p class="models">${esc(x.models)}</p>
          ${x.note ? `<p class="note">${esc(x.note)}</p>` : ""}
          <div class="ref-tags"><span class="pill ${x.status}">${statusLabel[x.status]}</span><span class="pill">${costLabel[x.cost]}</span></div>
          <div class="ref-foot"><span class="checked">Checked ${fmtDate(x.checked)}</span>${
            deep
              ? `<a class="deep" href="${esc(deep.href)}" target="_blank" rel="noopener noreferrer">${esc(deep.label)}</a>`
              : ""
          }</div>
        </article>`;
      })
      .join("");
  }

  /* ── render ── */
  const sync = (
    el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    v: string,
  ) => {
    if (document.activeElement !== el && el.value !== v) el.value = v;
  };
  const press = (
    root: ParentNode,
    sel: string,
    attr: string,
    isOn: (el: HTMLElement) => boolean,
  ) =>
    root
      .querySelectorAll<HTMLElement>(sel)
      .forEach((el) => el.setAttribute(attr, String(isOn(el))));

  function renderTabs(): void {
    tabs.forEach((t) => {
      const on = t.dataset.layer === view.layer;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    (Object.keys(panels) as StyleLayer[]).forEach((layer) => {
      $(`panel-${layer}`).hidden = layer !== view.layer;
    });
  }

  function renderPrompt(segments: readonly Segment[], el: HTMLElement): void {
    el.innerHTML = segments
      .map((s) => `<span class="s-${s.source}">${esc(s.text)}</span>`)
      .join("");
  }

  function render(): void {
    frame = 0;
    const r = store.get();
    compiled = compile(r);

    // brief
    sync(idea, r.idea);
    sync(headline, r.headline);
    sync(detail, r.detail);
    sync(purpose, r.purpose);
    sync(goalPicker, view.goal);
    renderDirections(r);
    renderDirectionExplorer();
    if (document.activeElement !== extra) sync(extra, r.extraText.join("\n"));
    renderAspectOptions(r);
    const ideaIsInvalid = r.idea.trim().length < 3;
    $("idea-error").hidden = !ideaIsInvalid;
    idea.setAttribute("aria-invalid", String(ideaIsInvalid));
    $("f-aspect")
      .querySelectorAll<HTMLInputElement>("[data-aspect]")
      .forEach((input) => (input.checked = input.value === r.aspect));
    document
      .querySelectorAll<HTMLInputElement>("[data-textmode]")
      .forEach((input) => (input.checked = input.value === r.textMode));
    press(
      presetsEl,
      "[data-preset]",
      "aria-current",
      (el) => el.dataset.preset === view.presetId,
    );

    // layers
    renderTabs();
    for (const layer of ["design", "art", "technique"] as const) {
      styleRenderers[layer]();
      press(
        panels[layer],
        "[data-style]",
        "aria-pressed",
        (el) => el.dataset.style === r.styles[layer],
      );
      $(`cur-${layer}`).textContent = getStyle(r.styles[layer]).name;
    }

    // palette
    const pal = effectivePalette(r);
    const locked =
      r.styles.technique === "cyanotype" ||
      r.styles.technique === "mono-accent";
    r.palette.forEach((c, i) => {
      const input = $<HTMLInputElement>(`sw-${i}`);
      if (document.activeElement !== input) input.value = c.hex.toLowerCase();
      input.parentElement!.style.background = pal[i]!.hex;
      input.disabled =
        locked && !(r.styles.technique === "mono-accent" && i === 1);
      $(`sw-nm-${i}`).textContent = pal[i]!.name;
      $(`sw-hx-${i}`).textContent = pal[i]!.hex.toUpperCase();
    });
    $("palette-note").textContent = locked
      ? `${getStyle(r.styles.technique).name} sets the inks${r.styles.technique === "mono-accent" ? "; only Ink A stays editable" : ""}.`
      : "Three inks. Click a swatch to change it.";
    renderVariations(r);

    // typography
    const sample = r.headline.trim() || "Objects in motion";
    specimensEl
      .querySelectorAll<HTMLElement>("[data-sample]")
      .forEach((el) => (el.textContent = sample));
    $("font-preview-sample").textContent =
      r.headline.trim() || "OBJECTS IN MOTION";
    press(
      specimensEl,
      "[data-font]",
      "aria-pressed",
      (el) => el.dataset.font === r.font,
    );
    const selectedFont = r.font === "style" ? undefined : getFont(r.font);
    $("selected-font-label").textContent =
      selectedFont?.family ?? "Let the style decide";
    const lettering = [r.styles.design, r.styles.art]
      .map((id) => getStyle(id))
      .find((s) => s.traits.includes("ownLettering"));
    $("spec-auto-note").textContent = lettering
      ? `${lettering.name} lettering`
      : (getFont(getStyle(r.styles.design).fontId ?? "")?.classification ?? "");
    const selectedDescription = selectedFont
      ? `${categoryName[selectedFont.category]} · ${selectedFont.classification}`
      : lettering
        ? `${lettering.name} lettering`
        : `${getStyle(r.styles.design).name} style lettering`;
    $("selected-font-caption").textContent = selectedDescription;
    $("font-picker-current-name").textContent =
      selectedFont?.family ?? "Let the style decide";
    $("font-picker-current-meta").textContent = selectedDescription;
    const previewFont =
      selectedFont ?? getFont(getStyle(r.styles.design).fontId ?? "inter");
    const supportsBold =
      !selectedFont || selectedFont.weights.some((weight) => weight >= 700);
    const supportsItalic = !selectedFont || selectedFont.italic;
    const appliedBold = r.fontWeight === "bold" && supportsBold;
    const appliedItalic = r.fontItalic && supportsItalic;
    const preview = $("font-preview-sample");
    preview.style.fontFamily = previewFont?.css ?? "sans-serif";
    preview.style.fontWeight = String(
      appliedBold
        ? (previewFont?.weights.find((weight) => weight >= 700) ?? 700)
        : (previewFont?.weights[0] ?? 400),
    );
    preview.style.fontStyle = appliedItalic ? "italic" : "normal";
    const boldButton = specimensEl.querySelector<HTMLButtonElement>(
      '[data-font-weight="bold"]',
    );
    if (boldButton) {
      boldButton.disabled = !supportsBold;
      boldButton.setAttribute("aria-pressed", String(appliedBold));
      boldButton.title = supportsBold
        ? "Preview bold weight"
        : `${selectedFont!.family} has no bundled bold face`;
    }
    const regularButton = specimensEl.querySelector<HTMLButtonElement>(
      '[data-font-weight="regular"]',
    );
    regularButton?.setAttribute(
      "aria-pressed",
      String(r.fontWeight === "regular" || !supportsBold),
    );
    const italicButton =
      specimensEl.querySelector<HTMLButtonElement>("[data-font-italic]");
    if (italicButton) {
      italicButton.disabled = !supportsItalic;
      italicButton.setAttribute("aria-pressed", String(appliedItalic));
      italicButton.title = supportsItalic
        ? "Preview italic lettering"
        : `${selectedFont!.family} has no bundled italic face`;
    }
    const emphasis = [
      appliedBold ? "Bold" : "Regular",
      appliedItalic ? "Italic" : "",
    ].filter(Boolean);
    $("font-preview-caption").textContent =
      `${previewFont?.family ?? "Style lettering"} · ${emphasis.join(" · ")}`;
    specimensEl
      .querySelectorAll<HTMLButtonElement>("[data-font-category]")
      .forEach((button) => {
        const selected = button.dataset.fontCategory === fontCategoryFilter;
        button.setAttribute("aria-pressed", String(selected));
        button.classList.toggle("btn-ghost", !selected);
      });

    // exclusions
    sync(cliche, r.cliche);
    const c = getCliche(r.cliche);
    $("cliche-items").textContent = c.items.length
      ? `Will exclude: ${c.items.join(", ")}.`
      : "No subject clichés selected.";
    const skipped = new Map(compiled.skipped.map((s) => [s.id, s.reason]));
    $("avoids")
      .querySelectorAll<HTMLElement>("[data-avoid]")
      .forEach((el) => {
        const id = el.dataset.avoid as AvoidId;
        const on = r.avoids.includes(id);
        el.setAttribute("aria-pressed", String(on));
        const reason = on ? skipped.get(id) : undefined;
        el.classList.toggle("skipped", Boolean(reason));
        el.querySelector(".why")!.textContent = reason
          ? `skipped: ${reason}`
          : "";
      });
    press($("signatures"), "[data-sig]", "aria-pressed", (el) =>
      r.signatures.includes(el.dataset.sig as SignatureId),
    );

    // proof
    const { w, h } = aspectRatio(r.aspect);
    const design = getStyle(r.styles.design);
    const font =
      r.font === "style" ? getFont(design.fontId ?? "inter") : getFont(r.font);
    $("proof").innerHTML = proofSvg({
      design: r.styles.design,
      art: r.styles.art,
      technique: r.styles.technique,
      inks: inksFrom([pal[0].hex, pal[1].hex, pal[2].hex]),
      ratio: h / w,
      headline: r.textMode === "render" ? r.headline : "",
      foot: r.textMode === "render" ? r.extraText : [],
      fontCss: font?.css ?? "sans-serif",
      condensed: font?.id === "oswald" || font?.id === "bebas",
      uid: "proof",
      label: `Sketch: ${design.name} layout, ${getStyle(r.styles.art).name}, ${getStyle(r.styles.technique).name} finish`,
    });
    const typeName = lettering
      ? `${lettering.name} lettering`
      : r.font === "style"
        ? "Style decides"
        : (font?.family ?? "");
    $("seps").innerHTML = [
      ["design", "c", "Layout", design.name],
      ["art", "m", "Imagery", getStyle(r.styles.art).name],
      ["technique", "y", "Finish", getStyle(r.styles.technique).name],
      ["type", "k", "Type", typeName],
    ]
      .map(
        ([src, ink, label, val]) =>
          `<li data-src="${src}"><i class="sep ${ink}"></i><span><b>${label}</b> ${esc(val!)}</span></li>`,
      )
      .join("");

    // target & pattern
    $("f-target")
      .querySelectorAll<HTMLInputElement>("[data-target]")
      .forEach((input) => (input.checked = input.value === r.target));
    const t = TARGETS.find((x) => x.id === r.target)!;
    $("target-note").textContent = `${t.model}. ${t.note}`;
    const allowed = PATTERNS_BY_TARGET[r.target];
    const optionsKey = allowed.join();
    if (pattern.dataset.key !== optionsKey) {
      pattern.innerHTML = PATTERNS.filter((p) => allowed.includes(p.id))
        .map((p) => `<option value="${p.id}">${esc(p.label)}</option>`)
        .join("");
      pattern.dataset.key = optionsKey;
    }
    pattern.value = compiled.pattern;
    pattern.disabled = allowed.length === 1;
    $("pattern-hint").textContent = PATTERNS.find(
      (p) => p.id === compiled.pattern,
    )!.hint;
    $("lang-field").hidden = !(
      compiled.pattern === "seven-line" || compiled.pattern === "restyle"
    );
    document
      .querySelectorAll<HTMLInputElement>("[data-lang]")
      .forEach((input) => (input.checked = input.value === r.language));
    $("edit-fields").hidden = compiled.pattern !== "edit";
    sync(change, r.edit.change);
    sync(preserve, r.edit.preserve);
    $("mj-fields").hidden = r.target !== "midjourney";
    if (document.activeElement !== sref)
      sref.value = r.midjourney.sref.join(" ");
    raw.checked = r.midjourney.raw;
    sync(
      stylize,
      r.midjourney.stylize === null ? "" : String(r.midjourney.stylize),
    );

    // prompt
    renderPrompt(compiled.segments, promptEl);
    promptEl.className = `prompt${view.highlight ? ` hl-${view.highlight}` : ""}`;
    $("prompt-count").textContent =
      `${compiled.text.length.toLocaleString()} characters`;
    $("neg-wrap").hidden = compiled.negative === null;
    $("btn-copy-neg").hidden = compiled.negative === null;
    if (compiled.negative) renderPrompt(compiled.negative, negEl);
    $("notices").innerHTML = compiled.notices
      .map((n) => `<li class="${n.level}">${esc(n.message)}</li>`)
      .concat(
        compiled.skipped.length
          ? [
              `<li>Skipped ${esc(compiled.skipped.map((s) => s.label.toLowerCase()).join(", "))}: the chosen style depends on it.</li>`,
            ]
          : [],
      )
      .join("");
    const bl = $("baseline");
    bl.hidden = !view.baseline;
    $("btn-baseline").setAttribute("aria-pressed", String(view.baseline));
    if (view.baseline) {
      bl.innerHTML = `<b>Undirected:</b> ${esc(compiled.baseline)} <br/>${compiled.baseline.length} characters and no decisions, so the model fills every gap with its average.`;
    }

    renderRefs(r);
  }

  function schedule(): void {
    if (!frame) frame = requestAnimationFrame(render);
  }

  let saveTimer = 0;
  store.subscribe((next) => {
    schedule();
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => save(next), 300);
  });

  render();
}

function clonePaletteValue(p: Recipe["palette"]): Recipe["palette"] {
  return [{ ...p[0] }, { ...p[1] }, { ...p[2] }];
}
