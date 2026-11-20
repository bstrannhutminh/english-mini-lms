"use client";

import { useId, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui";

/** Disclosure only hides the source column; the editor and recorder stay mounted. */
export function SessionColumns({ left, right, collapsible = false, sourceLabel = "Đề bài và nguồn" }: {
  left: ReactNode;
  right: ReactNode;
  collapsible?: boolean;
  sourceLabel?: string;
}) {
  const [sourceOpen, setSourceOpen] = useState(false);
  const sourceId = useId();
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-8">
      <div className="min-w-0">
        {collapsible && (
          <button type="button" aria-expanded={sourceOpen} aria-controls={sourceId} onClick={() => setSourceOpen(!sourceOpen)} className="mb-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 text-left text-base font-medium text-text lg:hidden">
            {sourceLabel}<Icon name="chevron-down" className={`h-4 w-4 shrink-0 transition-transform ${sourceOpen ? "rotate-180" : ""}`} />
          </button>
        )}
        <div id={sourceId} className={collapsible && !sourceOpen ? "hidden lg:block" : "block"}>{left}</div>
      </div>
      <div className="min-w-0">{right}</div>
    </div>
  );
}
