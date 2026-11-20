"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

/** A menu opens onto an item, moves focus with arrows, and returns to its trigger. */
export function useUserMenuNavigation() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const initialItem = useRef(0);

  const close = (restore = false) => {
    setOpen(false);
    if (restore) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const items = menuRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']");
    const index = initialItem.current < 0 ? (items?.length ?? 1) - 1 : 0;
    items?.[index]?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    initialItem.current = event.key === "ArrowUp" ? -1 : 0;
    setOpen(true);
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    let next: number;
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (event.key === "Tab") { close(true); return; }
    if (event.key === "ArrowDown") next = (index + 1) % items.length;
    else if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    items[next]?.focus();
  };

  const toggle = () => { initialItem.current = 0; setOpen((value) => !value); };
  return { open, rootRef, triggerRef, menuRef, close, toggle, onTriggerKeyDown, onMenuKeyDown };
}
