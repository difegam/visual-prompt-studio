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
import { MIXES, PRESETS, applyPreset, clonePalette } from "../domain/presets";
import {
  ASPECTS,
  ASPECT_LABELS,
  DEFAULT_RECIPE,
  PATTERNS,
  PATTERNS_BY_TARGET,
  PURPOSES,
  SIGNATURES,
  TARGETS,
  aspectRatio,
  parseRecipe,
  parseRecipeJson,
  type Aspect,
  type PatternId,
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
  type StyleLayer,
  type TechniqueId,
} from "../domain/styles";
import { finishSvg, inksFrom, motifSvg, proofSvg } from "./sketch";

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
  highlight: string | null;
}

export function startApp(): void {
  const store = new Store(loadSaved() ?? DEFAULT_RECIPE);
  const view: View = {
    layer: "design",
    baseline: false,
    refKind: "all",
    presetId: null,
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

  purpose.innerHTML = PURPOSES.map(
    (p) => `<option value="${p.id}">${esc(p.label)}</option>`,
  ).join("");
  $("f-aspect").innerHTML = ASPECTS.map(
    (a) =>
      `<label class="seg-option"><input class="radio" type="radio" name="aspect" value="${a}" data-aspect="${a}" /><span><b>${a}</b><small>${ASPECT_LABELS[a]}</small></span></label>`,
  ).join("");

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
  purpose.addEventListener("change", () => {
    const p = PURPOSES.find((x) => x.id === purpose.value);
    if (p) patch({ purpose: p.id, aspect: p.aspect });
  });
  $("f-aspect").addEventListener("change", (e) => {
    const input = (e.target as HTMLElement).closest<HTMLInputElement>(
      "[data-aspect]",
    );
    if (input && ASPECTS.includes(input.value as Aspect)) {
      patch({ aspect: input.value as Aspect });
    }
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
  presetsEl.innerHTML = PRESETS.map((p) => {
    const d = getStyle(p.patch.styles.design);
    const inks = inksFrom(
      d.palette
        ? [d.palette[0].hex, d.palette[1].hex, d.palette[2].hex]
        : ["#eee", "#333", "#999"],
    );
    const thumb = proofSvg({
      design: p.patch.styles.design,
      art: p.patch.styles.art,
      technique: "clean",
      inks,
      ratio: 1.25,
      headline: "",
      foot: [],
      fontCss: "sans-serif",
      condensed: false,
      uid: `pre-${p.id}`,
    });
    return `<button type="button" class="start" role="listitem" data-preset="${p.id}"><span class="thumb">${thumb}</span><span><b>${esc(p.name)}</b><span>${esc(p.blurb)}</span></span></button>`;
  }).join("");
  presetsEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-preset]",
    );
    const preset = PRESETS.find((p) => p.id === b?.dataset.preset);
    if (!preset) return;
    const before = store.get();
    view.presetId = preset.id;
    store.set(applyPreset(before, preset));
    say(`Loaded “${preset.name}”.`, () => store.set(before));
  });

  /* ── style tiles ── */
  const tabs =
    document.querySelectorAll<HTMLButtonElement>('.tabs [role="tab"]');
  const panels: Record<StyleLayer, HTMLElement> = {
    design: $("panel-design"),
    art: $("panel-art"),
    technique: $("panel-technique"),
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
    panels[layer].innerHTML = stylesOf(layer)
      .map(
        (s) =>
          `<button type="button" class="tile" data-layer="${layer}" data-style="${s.id}" aria-pressed="false">
            <span class="art" data-thumb="${s.id}"></span>
            <span class="meta"><b>${esc(s.name)}</b><small>${esc(s.era)}</small><span>${esc(s.summary)}</span></span>
          </button>`,
      )
      .join("");
    panels[layer].addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-style]",
      );
      if (b) selectStyle(layer, b.dataset.style!);
    });
  }

  // Design thumbnails show each movement in its own palette; they never change.
  for (const s of stylesOf("design")) {
    const p = s.palette!;
    panels.design.querySelector(`[data-thumb="${s.id}"]`)!.innerHTML = proofSvg(
      {
        design: s.id as DesignId,
        art: "none",
        technique: "clean",
        inks: inksFrom([p[0].hex, p[1].hex, p[2].hex]),
        ratio: 11 / 16,
        headline: s.name.split(" ")[0]!.toUpperCase(),
        foot: [],
        fontCss: getFont(s.fontId ?? "inter")?.css ?? "sans-serif",
        condensed: s.fontId === "oswald" || s.fontId === "bebas",
        uid: `t-${s.id}`,
        label: `${s.name} layout sketch`,
      },
    );
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
  specimensEl.innerHTML =
    `<button type="button" class="spec auto" data-font="style" aria-pressed="false"><span class="sample">Let the style decide</span><span class="foot"><b>Recommended</b><span id="spec-auto-note"></span></span></button>` +
    FONTS.map(
      (f) =>
        `<button type="button" class="spec" data-font="${f.id}" aria-pressed="false"><span class="sample" style="font-family:${esc(f.css)};font-weight:${f.weights.at(-1)}" data-sample></span><span class="foot"><b>${esc(f.family)}</b><span>${esc(f.classification)}</span></span></button>`,
    ).join("");
  specimensEl.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-font]",
    );
    if (b) patch({ font: b.dataset.font as "style" | FontId });
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
  async function copyPrompt(): Promise<void> {
    const ok = await copyText(compiled.text, promptEl);
    say(
      ok
        ? `Copied ${compiled.text.length.toLocaleString()} characters.`
        : "Copy was blocked. The prompt is selected: press Ctrl+C or ⌘C.",
    );
  }
  $("btn-copy").addEventListener("click", () => void copyPrompt());
  $("btn-copy-mobile").addEventListener("click", () => void copyPrompt());
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
    const names = [
      r.styles.art !== "none" ? getStyle(r.styles.art).name : null,
      getStyle(r.styles.design).name,
      getStyle(r.styles.technique).name,
    ].filter((x): x is string => x !== null);
    $("refs").innerHTML = REFERENCES.filter(
      (x) => view.refKind === "all" || x.kind === view.refKind,
    )
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
    (Object.keys(panels) as StyleLayer[]).forEach(
      (l) => (panels[l].hidden = l !== view.layer),
    );
  }

  let thumbKey = "";
  function renderThumbs(r: Recipe): void {
    const pal = effectivePalette(r);
    const key = pal.map((c) => c.hex).join();
    if (key === thumbKey) return;
    thumbKey = key;
    const inks = inksFrom([pal[0].hex, pal[1].hex, pal[2].hex]);
    for (const s of stylesOf("art")) {
      panels.art.querySelector(`[data-thumb="${s.id}"]`)!.innerHTML = motifSvg(
        s.id as ArtId,
        inks,
        `a-${s.id}`,
      );
    }
    for (const s of stylesOf("technique")) {
      // Techniques that dictate color preview in their own palette.
      const own = effectivePalette({
        ...r,
        styles: { ...r.styles, technique: s.id as TechniqueId },
      });
      const k = inksFrom([own[0].hex, own[1].hex, own[2].hex]);
      panels.technique.querySelector(`[data-thumb="${s.id}"]`)!.innerHTML =
        finishSvg(s.id as TechniqueId, k, `f-${s.id}`);
    }
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
    if (document.activeElement !== extra) sync(extra, r.extraText.join("\n"));
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
      press(
        panels[layer],
        "[data-style]",
        "aria-pressed",
        (el) => el.dataset.style === r.styles[layer],
      );
      $(`cur-${layer}`).textContent = getStyle(r.styles[layer]).name;
    }
    renderThumbs(r);

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
    press(
      specimensEl,
      "[data-font]",
      "aria-pressed",
      (el) => el.dataset.font === r.font,
    );
    const lettering = [r.styles.design, r.styles.art]
      .map((id) => getStyle(id))
      .find((s) => s.traits.includes("ownLettering"));
    $("spec-auto-note").textContent = lettering
      ? `${lettering.name} lettering`
      : (getFont(getStyle(r.styles.design).fontId ?? "")?.classification ?? "");

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
