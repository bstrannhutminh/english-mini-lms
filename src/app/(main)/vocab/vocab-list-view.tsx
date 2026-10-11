"use client";

import { useState } from "react";
import Link from "next/link";
import { YouGlishButton } from "@/components/youglish-widget";

export interface VocabularyItem {
  id: string;
  learnerId: string;
  phrase: string;
  ipa: string | null;
  contextMeaning: string | null;
  originalSentence: string | null;
  sourceType: string | null;
  sourceRef: string | null;
  myAttempt: string | null;
  masteryLevel: number;
  dueAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface VocabListViewProps {
  initialItems: VocabularyItem[];
}

// SVG Vector Icons — Zero dependencies, accessible & crisp
function CardsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="16" height="14" rx="2" />
      <path d="M6 3h12a2 2 0 0 1 2 2v12" />
    </svg>
  );
}

function SparklesIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
    </svg>
  );
}

function BookOpenIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function ClockIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function BookmarkIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function PenIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function SaveIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export function VocabListView({ initialItems }: VocabListViewProps) {
  const [items, setItems] = useState<VocabularyItem[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState<"all" | "due" | "mastered">("all");
  const [expandedId, setExpandedId] = useState<string | null>(
    initialItems.length > 0 ? initialItems[0].id : null
  );
  const [attemptInputs, setAttemptInputs] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const item of initialItems) {
      map[item.id] = item.myAttempt || "";
    }
    return map;
  });
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);

  const now = new Date();

  // Đếm số từ đến hạn và đã thuộc
  const dueCount = items.filter(
    (i) => new Date(i.dueAt) <= now && i.masteryLevel < 4
  ).length;

  const masteredCount = items.filter((i) => i.masteryLevel >= 4).length;

  // Lọc items theo activeFilter
  const filteredItems = items.filter((item) => {
    if (activeFilter === "due") {
      return new Date(item.dueAt) <= now && item.masteryLevel < 4;
    }
    if (activeFilter === "mastered") {
      return item.masteryLevel >= 4;
    }
    return true;
  });

  // Chuyển tab lọc
  async function handleFilterChange(filter: "all" | "due" | "mastered") {
    setActiveFilter(filter);
    try {
      setIsLoadingFilter(true);
      const res = await fetch(`/api/v1/vocabulary?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setAttemptInputs((prev) => {
          const next = { ...prev };
          for (const item of data.items) {
            if (next[item.id] === undefined) {
              next[item.id] = item.myAttempt || "";
            }
          }
          return next;
        });
      }
    } catch (err) {
      console.error("Lỗi tải danh sách từ:", err);
    } finally {
      setIsLoadingFilter(false);
    }
  }

  // Lưu "Câu của tôi" (my_attempt)
  async function handleSaveAttempt(itemId: string) {
    const attemptText = attemptInputs[itemId] || "";
    try {
      setSavingMap((prev) => ({ ...prev, [itemId]: true }));

      const res = await fetch(`/api/v1/vocabulary/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          my_attempt: attemptText,
        }),
      });

      if (!res.ok) {
        throw new Error("Không thể lưu câu tự đặt");
      }

      const data = await res.json();

      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, myAttempt: data.vocabulary.myAttempt } : i
        )
      );

      setSavedMap((prev) => ({ ...prev, [itemId]: true }));
      setTimeout(() => {
        setSavedMap((prev) => ({ ...prev, [itemId]: false }));
      }, 2500);
    } catch (err) {
      console.error("Lỗi khi lưu câu tự đặt:", err);
      alert("Lỗi khi lưu câu của bạn. Vui lòng thử lại.");
    } finally {
      setSavingMap((prev) => ({ ...prev, [itemId]: false }));
    }
  }

  // Đánh dấu đã thuộc / cần ôn
  async function handleToggleMastered(itemId: string, currentLevel: number) {
    const newLevel = currentLevel >= 4 ? 0 : 4;
    try {
      const res = await fetch(`/api/v1/vocabulary/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mastery_level: newLevel,
        }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === itemId ? { ...i, masteryLevel: newLevel } : i
          )
        );
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái thuộc từ:", err);
    }
  }

  // Nhóm các mục theo ngày
  const groupedByDate: Record<string, VocabularyItem[]> = {};
  for (const item of filteredItems) {
    const dateStr = new Date(item.createdAt).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    if (!groupedByDate[dateStr]) {
      groupedByDate[dateStr] = [];
    }
    groupedByDate[dateStr].push(item);
  }

  return (
    <div className="mx-auto w-full max-w-3xl lg:max-w-5xl px-4 pt-6 pb-20 space-y-6">
      {/* Header trang — Medical Clean & Professional */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center shrink-0">
              <BookmarkIcon className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Sổ từ vựng Y khoa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-10.5">
            Ngữ cảnh lâm sàng • 1-Chạm Quick-Capture • Spaced Repetition
          </p>
        </div>

        {/* Nút hành động nhanh */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/vocab/flashcards"
            data-tour="vocab-flashcards"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer min-h-[44px]"
          >
            <CardsIcon className="w-4 h-4" />
            <span>Ôn nhanh Flashcard</span>
          </Link>
          <Link
            href="/vocab/review"
            data-tour="vocab-review"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer min-h-[44px]"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Thử thách câu</span>
          </Link>
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer min-h-[44px]"
          >
            <BookOpenIcon className="w-4 h-4 text-slate-500" />
            <span>Đọc tra từ</span>
          </Link>
        </div>
      </div>

      {/* Tabs lọc: Tất cả / Đến hạn / Đã thuộc (Pill Segmented Control) */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 flex-wrap">
        <button
          onClick={() => handleFilterChange("all")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[40px] flex items-center gap-2 ${
            activeFilter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
          }`}
        >
          <span>Tất cả</span>
          <span className="px-1.5 py-0.5 rounded-md text-[11px] bg-white/20 tabular-nums">
            {items.length}
          </span>
        </button>

        <button
          onClick={() => handleFilterChange("due")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[40px] flex items-center gap-2 ${
            activeFilter === "due"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/70"
          }`}
        >
          <ClockIcon className="w-3.5 h-3.5" />
          <span>Đến hạn ôn</span>
          <span className="px-1.5 py-0.5 rounded-md text-[11px] bg-amber-900/20 tabular-nums font-bold">
            {dueCount}
          </span>
        </button>

        <button
          onClick={() => handleFilterChange("mastered")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[40px] flex items-center gap-2 ${
            activeFilter === "mastered"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70"
          }`}
        >
          <CheckCircleIcon className="w-3.5 h-3.5" />
          <span>Đã thuộc</span>
          <span className="px-1.5 py-0.5 rounded-md text-[11px] bg-emerald-900/20 tabular-nums font-bold">
            {masteredCount}
          </span>
        </button>
      </div>

      {/* Trạng thái tải bộ lọc */}
      {isLoadingFilter && (
        <div className="text-center py-10 text-slate-400 text-sm font-medium">
          Đang lọc danh sách thuật ngữ...
        </div>
      )}

      {/* Danh sách rỗng */}
      {!isLoadingFilter && filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center shadow-xs max-w-lg mx-auto">
          <BookOpenIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base mb-1">
            {activeFilter === "due"
              ? "Tuyệt vời! Không có từ nào đang đến hạn ôn tập."
              : activeFilter === "mastered"
              ? "Chưa có từ nào được đánh dấu là Đã thuộc."
              : "Sổ từ vựng đang trống."}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5">
            Khi luyện Đọc–dịch y khoa, bôi đen cụm từ bất kỳ để tra cứu chuyên ngành và lưu 1-chạm vào Sổ từ vựng!
          </p>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition cursor-pointer min-h-[44px]"
          >
            Luyện đọc ngay (R1) →
          </Link>
        </div>
      )}

      {/* Danh sách gom theo ngày */}
      {!isLoadingFilter &&
        Object.entries(groupedByDate).map(([dateStr, dateItems]) => (
          <div key={dateStr} className="space-y-3">
            {/* Tiêu đề nhóm ngày */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Ngày lưu: {dateStr}</span>
              <span className="text-[11px] bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full font-semibold tabular-nums">
                {dateItems.length}
              </span>
            </div>

            {/* Các thẻ từ vựng trong ngày */}
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
              {dateItems.map((item) => {
                const isExpanded = expandedId === item.id;
                const dueDate = new Date(item.dueAt);
                const isDue = dueDate <= now && item.masteryLevel < 4;
                const isMastered = item.masteryLevel >= 4;
                const diffMs = dueDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={item.id}
                    data-tour={item.id === filteredItems[0]?.id ? "vocab-item" : undefined}
                    className={`bg-white rounded-2xl transition border overflow-hidden shadow-xs hover:shadow-sm ${
                      isDue
                        ? "border-amber-300 ring-1 ring-amber-200/50"
                        : "border-slate-200/80"
                    }`}
                  >
                    {/* Hàng tóm tắt từ vựng (Click để mở rộng/thu gọn) */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`p-4 sm:p-5 cursor-pointer flex items-start justify-between gap-3 transition ${
                        isExpanded ? "bg-slate-50/70" : "bg-white"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-baseline gap-2.5 flex-wrap">
                          <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                            {item.phrase}
                          </span>
                          {item.ipa && (
                            <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-mono border border-teal-200/60">
                              /{item.ipa.replace(/^\/|\/$/g, "")}/
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                          {item.contextMeaning || "(Chưa có nghĩa ngữ cảnh)"}
                        </div>
                      </div>

                      {/* Trạng thái Spaced Repetition & Nút mở rộng */}
                      <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        {isMastered ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                            <span>Đã thuộc</span>
                          </span>
                        ) : isDue || diffDays <= 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                            <ClockIcon className="w-3 h-3 text-amber-700" />
                            <span>Đến hạn</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full tabular-nums">
                            Ôn sau {diffDays} ngày
                          </span>
                        )}

                        <span
                          className={`text-slate-400 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          <ChevronDownIcon className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Chi tiết mở rộng: Câu gốc, nguồn, YouGlish, ô Câu của tôi */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-4">
                        {/* 1. Câu gốc trong y khoa */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpenIcon className="w-3 h-3 text-teal-600" />
                            <span>Câu gốc trong tài liệu y khoa:</span>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 italic">
                            &ldquo;{item.originalSentence}&rdquo;
                          </div>
                        </div>

                        {/* 2. Nguồn tham khảo & YouGlish widget */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          {item.sourceRef ? (
                            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              Nguồn: {item.sourceRef}
                            </span>
                          ) : (
                            <span />
                          )}

                          <YouGlishButton query={item.phrase} />
                        </div>

                        {/* 3. Ô "Câu của tôi" (my_attempt) */}
                        <div className="space-y-1.5 pt-1">
                          <label
                            htmlFor={`attempt-${item.id}`}
                            className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
                          >
                            <PenIcon className="w-3.5 h-3.5 text-teal-700" />
                            <span>Câu của tôi (Thực hành áp dụng lâm sàng / giao tiếp):</span>
                          </label>
                          <textarea
                            id={`attempt-${item.id}`}
                            value={attemptInputs[item.id] ?? ""}
                            onChange={(e) =>
                              setAttemptInputs((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            placeholder="Tự đặt một câu tiếng Anh sử dụng cụm từ này trong bối cảnh công việc / phòng khám..."
                            rows={3}
                            className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition leading-relaxed"
                          />
                        </div>

                        {/* Thanh nút lưu & đánh dấu */}
                        <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                          <button
                            onClick={() => handleSaveAttempt(item.id)}
                            disabled={savingMap[item.id]}
                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer min-h-[44px] ${
                              savedMap[item.id]
                                ? "bg-emerald-700 text-white"
                                : savingMap[item.id]
                                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                : "bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                            }`}
                          >
                            {savedMap[item.id] ? (
                              <>
                                <CheckCircleIcon className="w-4 h-4 text-emerald-300" />
                                <span>Đã lưu câu của tôi!</span>
                              </>
                            ) : savingMap[item.id] ? (
                              <span>Đang lưu...</span>
                            ) : (
                              <>
                                <SaveIcon className="w-4 h-4" />
                                <span>Lưu câu của tôi</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleMastered(item.id, item.masteryLevel)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer min-h-[44px] ${
                              isMastered
                                ? "bg-slate-50 hover:bg-slate-100 text-amber-800 border-amber-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                            }`}
                          >
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            <span>{isMastered ? "Chuyển về cần ôn" : "Đánh dấu đã thuộc"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
