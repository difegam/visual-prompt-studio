import type { Recipe } from "../domain/recipe";
import {
  STEPS,
  initialStep,
  isStepDone,
  loadExpert,
  neighbour,
  saveExpert,
  stepAnnouncement,
  stepIndex,
  stepSummary,
  type PathContext,
  type StepId,
} from "./guided-path";

interface Options {
  initial: Recipe;
  getRecipe: () => Recipe;
  /** Name of the direction applied in this session, if any. */
  getDirectionName: () => string | null;
  subscribe: (listener: () => void) => void;
  say: (message: string) => void;
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
}

/** Wires the step rail, Back/Next and the Expert view toggle. */
export function bindGuidedPath(options: Options): void {
  const root = byId("studio-app");
  const rail = byId<HTMLOListElement>("step-rail");
  const heading = byId("step-heading");
  const live = byId("step-live");
  const back = byId<HTMLButtonElement>("step-back");
  const next = byId<HTMLButtonElement>("step-next");
  const expertButton = byId<HTMLInputElement>("btn-expert");
  const copy = byId<HTMLButtonElement>("btn-copy");
  const opened = new WeakSet<HTMLDetailsElement>();
  const sendPanel = byId("send-panel");
  const composer = byId("step-nav").parentElement!;

  const ctx = (): PathContext => ({
    directionName: options.getDirectionName(),
  });

  let current: StepId = initialStep(options.initial, ctx());
  let enterTimer = 0;
  const summaries = new Map<StepId, string>();
  /** Arrival motion only runs after a user-initiated step change. */
  function playEntry(): void {
    window.clearTimeout(enterTimer);
    root.removeAttribute("data-entering");
    void root.offsetWidth; // restart the CSS animations
    root.setAttribute("data-entering", "");
    enterTimer = window.setTimeout(
      () => root.removeAttribute("data-entering"),
      900,
    );
  }
  /** Slide the indicator under the active step. */
  function placeIndicator(): void {
    const active = rail.querySelector<HTMLElement>("[aria-current=step]");
    const item = active?.parentElement;
    if (!item || item.offsetWidth === 0) return;
    rail.style.setProperty("--ind-x", `${item.offsetLeft}px`);
    rail.style.setProperty("--ind-w", `${item.offsetWidth}px`);
  }
  let expert = loadExpert(storage());

  const buttons = STEPS.map((step) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "step-tab";
    button.dataset.stepTab = step.id;
    button.dataset.chips = step.id;
    button.innerHTML =
      `<span class="step-n" aria-hidden="true">${stepIndex(step.id) + 1}</span>` +
      `<span class="step-label">${step.label}</span>` +
      `<small class="step-summary"></small>` +
      `<span class="step-chips" aria-hidden="true"></span>` +
      `<span class="step-done sr-only"></span>`;
    button.addEventListener("click", () => go(step.id, true));
    li.append(button);
    rail.append(li);
    return button;
  });

  function render(): void {
    const recipe = options.getRecipe();
    root.dataset.view = expert ? "expert" : "guided";
    root.dataset.step = current;
    expertButton.checked = expert;
    STEPS.forEach((step, i) => {
      const button = buttons[i]!;
      const done = isStepDone(step.id, recipe, ctx());
      if (step.id === "refine") {
        recipe.palette.forEach((ink, n) =>
          button.style.setProperty(`--ink-${n + 1}`, ink.hex),
        );
      }
      button.toggleAttribute("data-done", done);
      if (step.id === current) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
      const summaryEl = button.querySelector<HTMLElement>(".step-summary")!;
      const summary = stepSummary(step.id, recipe, ctx());
      if (summaries.has(step.id) && summaries.get(step.id) !== summary) {
        summaryEl.classList.remove("is-changed");
        void summaryEl.offsetWidth;
        summaryEl.classList.add("is-changed");
      }
      summaries.set(step.id, summary);
      summaryEl.textContent = summary;
      button.querySelector(".step-done")!.textContent = done ? " (done)" : "";
    });
    const info = STEPS[stepIndex(current)]!;
    heading.textContent = `${stepIndex(current) + 1} of ${STEPS.length} · ${info.heading}`;
    back.hidden = neighbour(current, -1) === null;
    const last = neighbour(current, 1) === null;
    next.textContent = last ? "Copy prompt" : "Next";
    placeIndicator();
  }

  function go(step: StepId, userInitiated: boolean): void {
    if (userInitiated && step !== current) {
      root.dataset.dir =
        stepIndex(step) > stepIndex(current) ? "forward" : "back";
      playEntry();
    }
    current = step;
    render();
    if (!userInitiated) return;
    live.textContent = stepAnnouncement(step);
    heading.focus({ preventScroll: true });
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    rail.scrollIntoView({
      block: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
  }

  function setExpert(value: boolean): void {
    expert = value;
    saveExpert(storage(), expert);
    // Expert view keeps Send to and the prompt shape beside the prompt, as before.
    if (expert)
      byId("proof-panel")
        .querySelector(".proof-inner")
        ?.insertBefore(
          sendPanel,
          byId("proof-panel").querySelector(".copy-dock"),
        );
    else composer.insertBefore(sendPanel, byId("step-nav"));
    document
      .querySelectorAll<HTMLDetailsElement>("details[data-advanced]")
      .forEach((details) => {
        if (expert && !details.open) {
          details.open = true;
          opened.add(details);
        } else if (!expert && opened.has(details)) {
          details.open = false;
          opened.delete(details);
        }
      });
    render();
  }

  back.addEventListener("click", () => {
    const prev = neighbour(current, -1);
    if (prev) go(prev, true);
  });
  next.addEventListener("click", () => {
    const following = neighbour(current, 1);
    if (following) go(following, true);
    else copy.click();
  });
  expertButton.addEventListener("change", () =>
    setExpert(expertButton.checked),
  );

  byId("btn-existing-image").addEventListener("click", () => {
    const pattern = byId<HTMLSelectElement>("f-pattern");
    const option = [...pattern.options].find((o) => o.value === "edit");
    const advanced = byId(
      "btn-existing-image",
    ).parentElement?.querySelector<HTMLDetailsElement>(
      "details[data-advanced]",
    );
    if (!option) {
      options.say(
        "This model has no edit-with-reference shape. Pick another model under Send to.",
      );
      return;
    }
    pattern.value = "edit";
    pattern.dispatchEvent(new Event("change", { bubbles: true }));
    if (advanced) advanced.open = true;
    // The store re-renders on the next frame; the field is hidden until then.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => byId<HTMLInputElement>("f-change").focus()),
    );
  });

  options.subscribe(render);
  new ResizeObserver(placeIndicator).observe(rail);
  // Let the first placement land without sliding in from the start.
  requestAnimationFrame(() => rail.setAttribute("data-ready", ""));
  if (expert) setExpert(true);
  else render();
}
