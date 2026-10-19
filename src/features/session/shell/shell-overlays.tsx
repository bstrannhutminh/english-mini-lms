"use client";

import { SmartCapturePopup } from "@/app/(main)/learn/[sessionId]/smart-capture-popup";
import type { CaptureSelection } from "../hooks/use-smart-capture";
import { SubmitOverlay } from "./submit-overlay";
import { SessionWrapUpModal } from "./wrap-up-modal";

/** Các lớp phủ của shell: overlay chấm bài, toast, capture popup, wrap-up modal. */
export function ShellOverlays({
  isSubmitting,
  submitTitle,
  submitDescription,
  toast,
  captureSelection,
  onCaptureClose,
  onCaptureSaved,
  wrapUpOpen,
  targetMinutes,
  canSubmit,
  isSaving,
  onSaveAndExit,
  onSubmit,
  onExtend,
}: {
  isSubmitting: boolean;
  submitTitle: string;
  submitDescription: string;
  toast: string | null;
  captureSelection: CaptureSelection | null;
  onCaptureClose: () => void;
  onCaptureSaved: () => void;
  wrapUpOpen: boolean;
  targetMinutes: number;
  canSubmit: boolean;
  isSaving: boolean;
  onSaveAndExit: () => void;
  onSubmit: () => void;
  onExtend: () => void;
}) {
  return (
    <>
      {isSubmitting && (
        <SubmitOverlay title={submitTitle} description={submitDescription} />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-24 right-5 z-[9999] rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      {captureSelection && (
        <SmartCapturePopup
          selectedText={captureSelection.selectedText}
          surroundingSentence={captureSelection.surroundingSentence}
          sourceRef={captureSelection.sourceRef}
          position={captureSelection.position}
          onClose={onCaptureClose}
          onSaved={onCaptureSaved}
        />
      )}

      <SessionWrapUpModal
        targetMinutes={targetMinutes}
        isOpen={wrapUpOpen}
        onSaveAndExit={onSaveAndExit}
        onSubmit={onSubmit}
        onExtend={onExtend}
        isSaving={isSaving}
        canSubmit={canSubmit}
      />
    </>
  );
}
