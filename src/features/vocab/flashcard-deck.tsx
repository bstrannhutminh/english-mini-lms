"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog, EmptyState, Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout";
import { useFlashcardDeck } from "./use-flashcard-deck";
import { useDeckExitGuard } from "./use-deck-exit-guard";
import { Flashcard } from "./flashcard";
import { DeckTopBar } from "./deck-top-bar";
import { DeckControls } from "./deck-controls";
import { DeckSaveFailed, DeckSummary } from "./deck-summary";
import { DeckExitDialog } from "./deck-exit-dialog";
import { readDeckSnapshot } from "./deck-review-storage";
import { normalizeYouGlishQuery } from "./youglish";
import { YouGlishModal } from "./youglish-modal";

export function FlashcardDeck() {
  const router = useRouter();
  const [confirm, setConfirm] = useState<null | "finish" | "abandon">(null);
  const [youGlishQuery, setYouGlishQuery] = useState<string | null>(null);
  const deck = useFlashcardDeck(confirm !== null || youGlishQuery !== null);
  const guard = useDeckExitGuard({
    unsaved: deck.batch.length > 0 && deck.saveStatus !== "saved",
    saving: deck.saving || deck.flyDirection !== null,
    save: () => deck.submitBatchReviews(deck.batch),
    discard: deck.resetReviews,
    changeMode: deck.handleFilterModeChange,
    navigate: (href) => router.push(href),
  });

  const finish = () => {
    if (deck.busy) return;
    if (deck.batch.length === 0) router.push("/vocab");
    else setConfirm("finish");
  };

  const openYouGlish = () => {
    const query = normalizeYouGlishQuery(deck.currentCard?.phrase);
    if (deck.busy || deck.loading || guard.pending !== null || !query) return;
    window.speechSynthesis?.cancel();
    setYouGlishQuery(query);
  };
  // The dialog makes the card inert; keep its trigger enabled for focus restoration.
  const cardActionsDisabled = youGlishQuery === null && (deck.busy || guard.pending !== null);

  let content;
  if (deck.saveStatus === "failed") {
    content = <DeckSaveFailed batchCount={deck.batch.length} saving={deck.saving}
      onRetry={() => deck.submitBatchReviews(deck.batch)} onAbandon={() => setConfirm("abandon")} />;
  } else if (deck.isFinished) {
    content = <DeckSummary history={deck.history} onReviewIncorrectOnly={deck.handleReviewIncorrectOnly} onSpeak={deck.speakPhrase} />;
  } else if (deck.loading) {
    content = <div className="space-y-4" role="status"><p className="sr-only">Đang chuẩn bị thẻ ôn…</p><Skeleton className="h-11 w-full rounded-xl" /><Skeleton className="h-80 w-full rounded-2xl sm:h-96" /><div className="grid grid-cols-2 gap-3"><Skeleton className="h-16 rounded-2xl" /><Skeleton className="h-16 rounded-2xl" /></div></div>;
  } else if (deck.error) {
    content = <EmptyState icon="alert-triangle" title="Không thể tải thẻ ôn" description={deck.error}
      action={<div className="flex flex-wrap justify-center gap-3"><button onClick={deck.handleRetry} className="pressable min-h-11 cursor-pointer rounded-xl bg-primary px-5 text-base font-semibold text-white hover:bg-primary-dark">Thử lại</button>
        {readDeckSnapshot() && <button onClick={() => setConfirm("abandon")} className="pressable min-h-11 cursor-pointer rounded-xl border border-border-strong bg-surface px-5 text-base font-medium text-text-secondary">Bỏ phiên cũ và tải lại</button>}
      </div>} />;
  } else if (deck.items.length === 0) {
    content = <EmptyState icon="check-circle" title="Không có từ nào đến hạn" description="Bạn có thể ôn tự do những từ đã lưu hoặc quay lại bài học."
      action={<div className="flex flex-wrap justify-center gap-3">
        <button onClick={() => deck.handleFilterModeChange("all")} className="pressable min-h-11 cursor-pointer rounded-xl bg-primary px-5 text-base font-semibold text-white hover:bg-primary-dark">Ôn tự do</button>
        <Link href="/vocab" className="pressable inline-flex min-h-11 items-center rounded-xl border border-border-strong bg-surface px-5 text-base font-medium text-text-secondary no-underline">Về Sổ từ</Link>
      </div>} />;
  } else {
    content = <div className="space-y-3 sm:space-y-4">
      <DeckTopBar currentIndex={deck.currentIndex} total={deck.items.length} filterMode={deck.filterMode}
        disabled={deck.busy} onModeChange={(mode) => { if (mode !== deck.filterMode) guard.request({ type: "mode", mode }); }} onFinishEarly={finish} />
      {deck.currentCard && <Flashcard item={deck.currentCard} isFlipped={deck.isFlipped} dragOffset={deck.dragOffset}
        isDragging={deck.isDragging} flyDirection={deck.flyDirection} hasNext={deck.currentIndex + 1 < deck.items.length}
        disabled={cardActionsDisabled} onOpenYouGlish={openYouGlish}
        onSpeak={deck.speakPhrase} handlers={deck.cardHandlers} />}
      <DeckControls canUndo={deck.history.length > 0 && deck.currentIndex > 0} disabled={deck.busy || guard.pending !== null}
        onDontKnow={() => deck.handleCardDecision("dont_know")} onUndo={deck.handleUndo} onFlip={deck.flipCard} onKnow={() => deck.handleCardDecision("know")} />
    </div>;
  }

  return <>
    <PageContainer size="narrow" className="space-y-3 max-sm:pt-3 sm:space-y-5">
      <header className="max-sm:sr-only"><h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Ôn bằng thẻ</h1><p className="mt-1 text-base leading-relaxed text-text-secondary">Nhớ lại cụm từ trước khi xem nghĩa và câu gốc.</p></header>
      {content}
    </PageContainer>
    {youGlishQuery !== null && createPortal(
      <YouGlishModal query={youGlishQuery} onClose={() => setYouGlishQuery(null)} />,
      document.body,
    )}
    <DeckExitDialog open={guard.pending !== null} count={deck.batch.length} saving={deck.saving}
      failed={deck.saveStatus === "failed"} onSave={guard.saveAndLeave} onDiscard={guard.discardAndLeave} onCancel={guard.cancel} />
    <ConfirmDialog open={confirm === "finish"} title="Lưu kết quả và xem tổng kết?"
      description={`Bạn đã ôn ${deck.batch.length} từ trong đợt này.`} confirmLabel="Lưu kết quả" cancelLabel="Ôn tiếp" loading={deck.saving}
      onConfirm={() => { setConfirm(null); void deck.submitBatchReviews(deck.batch); }} onCancel={() => setConfirm(null)} />
    <ConfirmDialog open={confirm === "abandon"} tone="danger" title="Bỏ kết quả đợt ôn này?"
      description={deck.batch.length > 0 ? `Kết quả ${deck.batch.length} từ sẽ không được lưu.` : "Phiên ôn được lưu tạm trong trình duyệt sẽ bị bỏ."} confirmLabel="Bỏ kết quả" cancelLabel="Ở lại"
      onConfirm={() => { deck.resetReviews(); setConfirm(null); if (deck.error) deck.handleRetry(); else router.push("/vocab"); }} onCancel={() => setConfirm(null)} />
  </>;
}
