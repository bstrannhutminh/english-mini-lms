"use client";

import { Modal } from "@/components/ui";
import { normalizeYouGlishQuery } from "./youglish";
import { YouGlishWidget } from "./youglish-widget";

interface YouGlishModalProps { query: string; onClose: () => void; }

export function YouGlishModal({ query, onClose }: YouGlishModalProps) {
  return <Modal open onClose={onClose} title={`Người bản xứ nói “${normalizeYouGlishQuery(query)}”`}
    description="Video từ YouTube qua YouGlish · giọng Mỹ / Anh / Úc" size="lg">
    <div data-youglish-modal><YouGlishWidget key={query} query={query} /></div>
  </Modal>;
}
