import type { KeyboardEvent } from "react";

/** Keep keyboard focus in the top dialog while its background is inert. */
export function containDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  event.stopPropagation();
  if (event.key !== "Tab") return;
  const dialog = event.currentTarget;
  const active = document.activeElement;
  const candidates = Array.from(dialog.querySelectorAll<HTMLElement>(
    "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], summary, iframe, [tabindex]:not([tabindex='-1'])"
  )).filter((element) => element.getClientRects().length > 0 && element.tabIndex >= 0);
  const first = candidates[0];
  const last = candidates[candidates.length - 1];
  if (!first || !last) { event.preventDefault(); dialog.focus(); return; }
  if (active === dialog || (event.shiftKey && active === first)) {
    event.preventDefault(); (event.shiftKey ? last : first).focus({ preventScroll: true });
  } else if (!event.shiftKey && active === last) {
    event.preventDefault(); first.focus({ preventScroll: true });
  }
}
