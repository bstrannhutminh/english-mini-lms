"use client";

import { useCallback, useEffect, useState } from "react";
import type { DeckFilterMode } from "./use-flashcard-deck";

export type DeckExitAction = { type: "mode"; mode: DeckFilterMode } | { type: "route"; href: string };

export function useDeckExitGuard({ unsaved, saving, save, discard, changeMode, navigate }: {
  unsaved: boolean;
  saving: boolean;
  save: () => Promise<boolean>;
  discard: () => void;
  changeMode: (mode: DeckFilterMode) => void;
  navigate: (href: string) => void;
}) {
  const [pending, setPending] = useState<DeckExitAction | null>(null);
  const apply = useCallback((action: DeckExitAction) => {
    if (action.type === "mode") changeMode(action.mode); else navigate(action.href);
  }, [changeMode, navigate]);
  const request = useCallback((action: DeckExitAction) => {
    if (saving) return;
    if (unsaved) setPending(action); else apply(action);
  }, [saving, unsaved, apply]);

  useEffect(() => {
    if (!unsaved) return;
    const intercept = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin || url.href === location.href) return;
      event.preventDefault(); event.stopPropagation();
      request({ type: "route", href: url.pathname + url.search + url.hash });
    };
    document.addEventListener("click", intercept, true);
    return () => document.removeEventListener("click", intercept, true);
  }, [unsaved, request]);

  const saveAndLeave = async () => {
    if (!pending || saving) return;
    const action = pending;
    if (await save()) { setPending(null); apply(action); }
  };
  const discardAndLeave = () => {
    if (!pending || saving) return;
    const action = pending; discard(); setPending(null); apply(action);
  };
  return { pending, request, saveAndLeave, discardAndLeave, cancel: () => setPending(null) };
}
