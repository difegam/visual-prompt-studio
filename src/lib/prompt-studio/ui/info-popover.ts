/** Reusable "info" button that opens a popover anchored to it. */
export interface InfoPopoverOptions {
  /** Unique element id for the popover. */
  id: string;
  /** Visible button label. */
  label: string;
  /** Pre-escaped HTML for the popover body. */
  content: string;
}

const ICON =
  '<svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6.25"/><path d="M8 7.25v3.5M8 5v.01" stroke-linecap="round"/></svg>';

export function renderInfoPopover({
  id,
  label,
  content,
}: InfoPopoverOptions): string {
  return `<button type="button" class="info-trigger" popovertarget="${id}" aria-haspopup="dialog">${ICON}${label}</button><div id="${id}" class="info-popover" popover role="dialog" aria-label="${label}">${content}</div>`;
}

let bound = false;

/** Position every `.info-popover` beside its trigger when it opens. Call once. */
export function bindInfoPopovers(): void {
  if (bound) return;
  bound = true;
  const place = (pop: HTMLElement): void => {
    const trigger = document.querySelector<HTMLElement>(
      `[popovertarget="${pop.id}"]`,
    );
    if (!trigger) return;
    const gap = 8;
    const margin = 12;
    const anchor = trigger.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - margin * 2);
    pop.style.width = `${width}px`;
    const left = Math.min(
      Math.max(margin, anchor.left),
      window.innerWidth - width - margin,
    );
    const height = pop.offsetHeight;
    const below = anchor.bottom + gap;
    const top =
      below + height > window.innerHeight - margin &&
      anchor.top - gap - height > margin
        ? anchor.top - gap - height
        : below;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  };
  document.addEventListener(
    "toggle",
    (event) => {
      const pop = event.target;
      if (
        pop instanceof HTMLElement &&
        pop.classList.contains("info-popover") &&
        pop.matches(":popover-open")
      )
        place(pop);
    },
    true,
  );
  const close = (): void =>
    document
      .querySelectorAll<HTMLElement>(".info-popover:popover-open")
      .forEach((pop) => pop.hidePopover());
  window.addEventListener("resize", close);
  window.addEventListener("scroll", close, { passive: true });
}
