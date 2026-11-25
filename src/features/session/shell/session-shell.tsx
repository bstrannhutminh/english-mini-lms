"use client";

import { ConfirmDialog } from "@/components/ui";
import { useState, type CSSProperties } from "react";
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
import { SessionHintSlotProvider } from "./session-hint-slot";
import { useMeasuredHeight } from "./use-measured-height";

/**
 * Khung phiên học dùng chung ở chế độ Tập trung (Learning Studio):
 * thanh ứng dụng tràn ngang + vạch tiến độ thời gian, xác nhận thoát, đồng hồ bền
 * bỉ qua sessionStorage, tự lưu nháp, thang gợi ý (đưa qua slot cho panel đặt
 * dưới công tắc Đề bài/Bài làm), cảnh báo mất mạng, Smart Capture, phím tắt,
 * thanh hành động dính đáy. Chiều cao header/thanh đáy được đo và phát qua
 * biến CSS --studio-header / --studio-action cho các phần tử sticky.
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
  const [actionSpace, setActionSpace] = useState(96);
  const header = useMeasuredHeight<HTMLElement>(60);
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
    hintError,
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
    handleToggleTimer,
    handleRequestHint,
    showCaptureSavedToast,
    onRequestExit,
  } = useSessionController(plugin, data);

  const HintContent = plugin.Hint;
  const overlayCopy = plugin.submittingCopy ?? {
    title: "Hệ thống đang chấm bài của bạn...",
    description: "Đang phân tích bài làm theo rubric. Quá trình mất khoảng 15–30 giây.",
  };

  const targetSeconds = Math.max(1, data.targetMinutes * 60);
  const elapsedRatio = 1 - Math.min(1, timer.secondsRemaining / targetSeconds);
  const bottomSpace = hideActionBar ? 0 : actionSpace;
  const studioVars = {
    "--studio-header": `${header.height}px`,
    "--studio-action": `${bottomSpace}px`,
    paddingBottom: bottomSpace + (hideActionBar ? 40 : 24),
  } as CSSProperties;

  const hintSlot = HintContent && !submissionResult ? (
    <HintBar
      label={plugin.hintLabel ?? "Xin gợi ý"}
      shown={hintShown}
      loading={hintLoading}
      error={hintError}
      onRequest={handleRequestHint}
    >
      <HintContent data={data} />
    </HintBar>
  ) : null;

  return (
    <div className="min-h-dvh" style={studioVars}>
      <ShellOverlays
        isSubmitting={isSubmitting}
        submitTitle={overlayCopy.title}
        submitDescription={overlayCopy.description}
        toast={toast}
        captureSelection={capture.selection}
        onCaptureClose={capture.close}
        onCaptureSaved={showCaptureSavedToast}
        wrapUpOpen={showWrapUp && !isSubmitting}
        targetMinutes={data.targetMinutes}
        canSubmit={submitCheck.ok && !hintLoading}
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
        headerRef={header.ref}
        title={data.activity.title}
        skill={plugin.skill}
        isIelts={isIelts}
        isRevision={Boolean(data.parentId)}
        timerFormatted={timer.formatted}
        timerActive={timer.isActive}
        isLowTime={timer.secondsRemaining < 300}
        elapsedRatio={elapsedRatio}
        onToggleTimer={handleToggleTimer}
        onRequestExit={onRequestExit}
        saveStatus={{
          lastSavedAt: autosave.lastSavedAt,
          isSaving: autosave.isSaving,
          saveFailed: autosave.saveFailed,
          onRetrySave: handleSaveDraft,
        }}
      />

      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:pt-6">
        <OfflineBanner isOnline={isOnline} onRetrySave={handleSaveDraft} />

        <SessionHintSlotProvider value={hintSlot}>
          <plugin.Panel
            data={data}
            state={state}
            setState={setState}
            busy={isSubmitting}
            postEvent={postEvent}
            capture={capture.helpers}
            submission={submissionResult}
          />
        </SessionHintSlotProvider>
      </div>

      {!hideActionBar && (
        <ActionBar
          canSubmit={submitCheck.ok && !hintLoading}
          submitDisabledReason={hintLoading ? "Đang ghi nhận yêu cầu gợi ý — hãy chờ trước khi nộp." : submitCheck.reason}
          isSubmitting={isSubmitting}
          isSaving={autosave.isSaving}
          submitError={submitError}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
          submitLabel={plugin.submitLabel}
          onHeightChange={setActionSpace}
        />
      )}
    </div>
  );
}
