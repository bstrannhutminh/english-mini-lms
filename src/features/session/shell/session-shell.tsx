"use client";

import { ConfirmDialog } from "@/components/ui";
import type {
  ModePlugin,
  SessionData,
} from "../modes/types";
import { ShellHeader } from "./shell-header";
import { OfflineBanner } from "./offline-banner";
import { HintBar } from "./hint-bar";
import { ActionBar } from "./action-bar";
import { ShellOverlays } from "./shell-overlays";
import { useSessionController } from "./use-session-controller";

/**
 * Khung phiên học dùng chung ở chế độ Tập trung (Focus Mode):
 * header sticky + xác nhận thoát, đồng hồ bền bỉ qua sessionStorage, tự lưu nháp,
 * thang gợi ý, cảnh báo mất mạng, Smart Capture, phím tắt, thanh hành động dính đáy.
 */
export function SessionShell({
  plugin,
  isIelts,
  data,
}: {
  plugin: ModePlugin;
  isIelts: boolean;
  data: SessionData;
}) {
  const {
    state,
    setState,
    submissionResult,
    showWrapUp,
    confirmExitOpen,
    setConfirmExitOpen,
    exiting,
    hintShown,
    hintLoading,
    toast,
    timer,
    postEvent,
    isOnline,
    autosave,
    isSubmitting,
    submitError,
    capture,
    submitCheck,
    hideActionBar,
    handleSubmit,
    handleSaveDraft,
    handleSaveAndExit,
    handleExtendTimer,
    handleRequestHint,
    showCaptureSavedToast,
    onRequestExit,
  } = useSessionController(plugin, data);

  const HintContent = plugin.Hint;
  const overlayCopy = plugin.submittingCopy ?? {
    title: "Hệ thống đang chấm bài của bạn...",
    description: "Đang phân tích bài làm theo rubric. Quá trình mất khoảng 15–30 giây.",
  };

  return (
    <div
      className={`mx-auto w-full max-w-[768px] px-4 pt-0 lg:max-w-[1200px] ${
        hideActionBar ? "pb-10" : "pb-36 sm:pb-32"
      }`}
    >
      <ShellOverlays
        isSubmitting={isSubmitting}
        submitTitle={overlayCopy.title}
        submitDescription={overlayCopy.description}
        toast={toast}
        captureSelection={capture.selection}
        onCaptureClose={capture.close}
        onCaptureSaved={showCaptureSavedToast}
        wrapUpOpen={showWrapUp}
        targetMinutes={data.targetMinutes}
        canSubmit={submitCheck.ok}
        isSaving={autosave.isSaving}
        onSaveAndExit={handleSaveAndExit}
        onSubmit={handleSubmit}
        onExtend={handleExtendTimer}
      />

      <ConfirmDialog
        open={confirmExitOpen}
        title="Tạm dừng phiên học?"
        description="Bản nháp của bạn sẽ được lưu lại để tiếp tục bất cứ lúc nào từ trang Hôm nay."
        confirmLabel="Lưu nháp & thoát"
        cancelLabel="Học tiếp"
        loading={exiting}
        onConfirm={() => void handleSaveAndExit()}
        onCancel={() => setConfirmExitOpen(false)}
      />

      <ShellHeader
        title={data.activity.title}
        skill={plugin.skill}
        isIelts={isIelts}
        isRevision={Boolean(data.parentId)}
        timerFormatted={timer.formatted}
        timerActive={timer.isActive}
        isLowTime={timer.secondsRemaining < 300}
        onToggleTimer={timer.toggle}
        onRequestExit={onRequestExit}
        saveStatus={{
          lastSavedAt: autosave.lastSavedAt,
          isSaving: autosave.isSaving,
          saveFailed: autosave.saveFailed,
          onRetrySave: handleSaveDraft,
        }}
      />

      <OfflineBanner isOnline={isOnline} onRetrySave={handleSaveDraft} />

      {HintContent && !submissionResult && (
        <HintBar
          label={plugin.hintLabel ?? "Xin gợi ý"}
          shown={hintShown}
          loading={hintLoading}
          onRequest={handleRequestHint}
        >
          <HintContent data={data} />
        </HintBar>
      )}

      <plugin.Panel
        data={data}
        state={state}
        setState={setState}
        busy={isSubmitting}
        postEvent={postEvent}
        capture={capture.helpers}
        submission={submissionResult}
      />

      {!hideActionBar && (
        <ActionBar
          canSubmit={submitCheck.ok}
          submitDisabledReason={submitCheck.reason}
          isSubmitting={isSubmitting}
          isSaving={autosave.isSaving}
          submitError={submitError}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
          submitLabel={plugin.submitLabel}
        />
      )}
    </div>
  );
}
