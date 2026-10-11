"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ActivityItem {
  id: string;
  title: string;
  mode: string;
  durationMinutes: number | null;
  objective: string | null;
  difficulty: string | null;
  actionType?: "continue_draft" | "start_revision" | "new_session";
  sessionId?: string;
  parentId?: string;
}

interface InProgressSessionItem {
  sessionId: string;
  activityId: string;
  targetMinutes: number;
  status: "active" | "paused";
  title: string;
  mode: string;
  slot: string | null;
}

interface TodayRecommendationData {
  learnerName?: string;
  baselineStatus?: string;
  recommendedActivity: ActivityItem | null;
  reason: string;
  alternateActivities: ActivityItem[];
  dueVocabCount: number;
  leastPracticedSkill: string;
  streakDays?: number;
  inProgressSession?: InProgressSessionItem | null;
}

interface TodayViewProps {
  initialTargetMinutes: 30 | 45;
  userEmail?: string;
  displayName?: string;
}

// SVG Vector Icons — Zero dependencies, accessible & crisp
function FlameIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c-.5 2.5-2 4.5-4 6-2 1.5-3 3.5-3 6 0 4 3 7 7 7s7-3 7-7c0-3-2-5.5-4.5-7-.5 2-1.5 3-2.5 3-.5 0-1-.5-1-1 0-2.5 1-4.5 1-7z" />
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

function UserIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PenToolIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
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

function MicIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function HeadphonesIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function PlayIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function RefreshIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
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

function CardsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="16" height="14" rx="2" />
      <path d="M6 3h12a2 2 0 0 1 2 2v12" />
    </svg>
  );
}

function BarChartIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function AlertTriangleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CompassIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

const MODE_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  writing: {
    label: "Viết chuyên môn",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200/80",
    icon: <PenToolIcon className="w-3.5 h-3.5 text-teal-700" />,
  },
  reading: {
    label: "Đọc - Dịch Y khoa",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    icon: <BookOpenIcon className="w-3.5 h-3.5 text-emerald-700" />,
  },
  speaking: {
    label: "Nói / Giao tiếp",
    badgeClass: "bg-indigo-50 text-indigo-800 border-indigo-200/80",
    icon: <MicIcon className="w-3.5 h-3.5 text-indigo-700" />,
  },
  listening: {
    label: "Nghe / Shadowing",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200/80",
    icon: <HeadphonesIcon className="w-3.5 h-3.5 text-amber-700" />,
  },
};

export default function TodayView({
  initialTargetMinutes,
  displayName,
}: TodayViewProps) {
  const router = useRouter();
  const [targetMinutes, setTargetMinutes] = useState<30 | 45>(initialTargetMinutes);
  const [data, setData] = useState<TodayRecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [starting, setStarting] = useState(false);
  const [showAlternates, setShowAlternates] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

  useEffect(() => {
    let active = true;

    fetch(`/api/v1/today?target_minutes=${targetMinutes}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể kết nối máy chủ");
        return res.json();
      })
      .then((json: TodayRecommendationData) => {
        if (active) {
          setData(json);
          setSelectedActivity(json.recommendedActivity);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("Lỗi tải gợi ý học tập:", err);
        if (active) {
          setError(
            err instanceof Error ? err.message : "Đã có lỗi xảy ra khi tải bài học gợi ý."
          );
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [targetMinutes, reloadCounter]);

  const handleSelectMinutes = (mins: 30 | 45) => {
    if (mins !== targetMinutes) {
      setLoading(true);
      setError(null);
      setTargetMinutes(mins);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadCounter((c) => c + 1);
  };

  const handleStartSession = async (activityId: string) => {
    setStarting(true);
    try {
      if (
        selectedActivity?.actionType === "continue_draft" &&
        selectedActivity?.sessionId
      ) {
        router.push(`/learn/${selectedActivity.sessionId}`);
        return;
      }

      const res = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityId,
          targetMinutes,
        }),
      });

      const revisionQuery =
        selectedActivity?.actionType === "start_revision" && selectedActivity?.parentId
          ? `?parentId=${encodeURIComponent(selectedActivity.parentId)}`
          : "";

      if (res.ok) {
        const json = await res.json();
        router.push(`/learn/${json.sessionId}${revisionQuery}`);
      } else if (res.status === 409) {
        const errJson = await res.json();
        const shouldContinue = window.confirm(
          "Bạn đang có một phiên học chưa hoàn thành cho bài này.\n\nBạn có muốn tiếp tục phiên đang dở không?"
        );
        if (shouldContinue && errJson.sessionId) {
          router.push(`/learn/${errJson.sessionId}${revisionQuery}`);
        } else {
          setStarting(false);
        }
      } else {
        const err = await res.json();
        alert(err.error || "Không thể khởi tạo phiên học");
        setStarting(false);
      }
    } catch (err) {
      console.error("Lỗi bắt đầu phiên học:", err);
      alert("Lỗi kết nối máy chủ");
      setStarting(false);
    }
  };

  const handleSwapActivity = () => {
    if (!data || data.alternateActivities.length === 0) return;
    setShowAlternates((prev) => !prev);
  };

  const currentActivity = selectedActivity || data?.recommendedActivity;
  const currentModeInfo = currentActivity
    ? MODE_CONFIG[currentActivity.mode] || {
        label: currentActivity.mode,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        icon: <BookOpenIcon className="w-3.5 h-3.5 text-slate-500" />,
      }
    : null;

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* 1. Header & Hero Card — Medical Clean & Professional Slate-Teal */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white p-6 sm:p-7 shadow-sm border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Xin chào, {displayName || "Bác sĩ Minh"}
              </h1>
              {data && typeof data.streakDays === "number" && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <FlameIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="tabular-nums">
                    {data.streakDays > 0 ? `${data.streakDays} ngày liên tiếp` : "0 ngày liên tiếp"}
                  </span>
                </div>
              )}
            </div>
            <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
              Mục tiêu phản xạ tiếng Anh y khoa & IELTS 7.5–8.0 với 30–45 phút tập trung mỗi ngày.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl transition border border-slate-700/80 font-medium cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Hồ sơ</span>
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl transition border border-slate-700/80 font-medium cursor-pointer"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Cài đặt</span>
            </Link>
          </div>
        </div>

        {/* Bộ chọn thời lượng mục tiêu: 30 / 45 phút */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-300">
            <ClockIcon className="w-4 h-4 text-teal-400" />
            <span>Thời lượng học mục tiêu hôm nay:</span>
          </div>

          <div className="inline-flex bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => handleSelectMinutes(30)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer min-h-[38px] ${
                targetMinutes === 30
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              30 phút
            </button>
            <button
              onClick={() => handleSelectMinutes(45)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer min-h-[38px] ${
                targetMinutes === 45
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              45 phút
            </button>
          </div>
        </div>
      </div>

      {/* Card báo lỗi khi tải dữ liệu thất bại */}
      {error && !loading && (
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-900">
                Không thể tải gợi ý bài học hôm nay
              </h3>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer min-h-[40px]"
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Khối Tiếp tục phiên đang dở */}
      {data?.inProgressSession && (
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-md border border-amber-300 flex items-center gap-1.5">
                <ClockIcon className="w-3 h-3 text-amber-800" />
                <span>Phiên đang dở</span>
              </span>
              <span className="text-xs text-amber-800 font-medium">
                {data.inProgressSession.slot ? `${data.inProgressSession.slot} · ` : ""}
                {MODE_CONFIG[data.inProgressSession.mode]?.label || data.inProgressSession.mode}
              </span>
            </div>
            <span className="text-xs text-amber-800/80 font-medium tabular-nums">
              Mục tiêu {data.inProgressSession.targetMinutes} phút
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              {data.inProgressSession.title}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Bạn có một phiên học chưa khép lại. Nhấp để tiếp tục bài làm ngay lập tức.
            </p>
          </div>

          <div className="pt-1">
            <Link
              href={`/learn/${data.inProgressSession.sessionId}`}
              className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer min-h-[44px]"
            >
              <PlayIcon className="w-3.5 h-3.5" />
              <span>Tiếp tục phiên học ngay</span>
            </Link>
          </div>
        </div>
      )}

      {/* Banner Khảo sát năng lực đầu vào nếu chưa hoàn thành */}
      {data && data.baselineStatus && data.baselineStatus !== "completed" && (
        <div className="bg-indigo-50/80 border border-indigo-200/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <CompassIcon className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-indigo-950">
                Bạn chưa hoàn tất khảo sát năng lực đầu vào
              </h3>
              <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">
                Thiết lập mục tiêu và hoàn thành khảo sát 15 phút để lộ trình học được cá nhân hoá chuẩn xác.
              </p>
            </div>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer min-h-[44px]"
          >
            Làm bài khảo sát ngay →
          </Link>
        </div>
      )}

      {/* 2. Banner Ôn từ vựng đến hạn (Spaced Repetition) */}
      {data && data.dueVocabCount > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <SparklesIcon className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <span>Sổ từ vựng y khoa</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white tabular-nums">
                  {data.dueVocabCount} từ cần ôn
                </span>
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                Áp dụng thuật toán Spaced Repetition giúp khắc sâu thuật ngữ y khoa vào trí nhớ dài hạn.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/vocab/flashcards"
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer min-h-[44px]"
            >
              <CardsIcon className="w-3.5 h-3.5" />
              <span>Ôn nhanh bằng Flashcard</span>
            </Link>
            <Link
              href="/vocab/review"
              className="inline-flex items-center justify-center whitespace-nowrap bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition shadow-xs cursor-pointer min-h-[44px]"
            >
              Thử thách câu →
            </Link>
          </div>
        </div>
      )}

      {/* 3. Thẻ gợi ý bài học chính theo thuật toán giải thích được */}
      {loading ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center shadow-xs">
          <div className="inline-block animate-spin text-teal-600 mb-3">
            <RefreshIcon className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-500 font-medium">Đang tính toán bài học tối ưu cho bạn...</p>
        </div>
      ) : currentActivity ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          {/* Header giải thích lý do gợi ý */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/70">
                <CompassIcon className="w-3.5 h-3.5 text-teal-600" />
                <span>Gợi ý hôm nay</span>
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {data?.reason}
              </span>
            </div>

            {data?.alternateActivities && data.alternateActivities.length > 0 && (
              <button
                onClick={handleSwapActivity}
                className="text-xs text-slate-500 hover:text-teal-700 font-medium flex items-center gap-1.5 transition cursor-pointer min-h-[36px] px-2 rounded-lg hover:bg-slate-50"
              >
                <RefreshIcon className="w-3.5 h-3.5" />
                <span>Đổi bài khác</span>
              </button>
            )}
          </div>

          {/* Chi tiết hoạt động */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {currentModeInfo && (
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-semibold inline-flex items-center gap-1.5 ${currentModeInfo.badgeClass}`}
                >
                  {currentModeInfo.icon}
                  <span>{currentModeInfo.label}</span>
                </span>
              )}
              {currentActivity.difficulty && (
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {currentActivity.difficulty}
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">
                {currentActivity.id}
              </span>
              {currentActivity.durationMinutes && (
                <span className="text-xs text-slate-500 tabular-nums">
                  • Chuẩn {currentActivity.durationMinutes} phút
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug tracking-tight">
              {currentActivity.title}
            </h2>

            {currentActivity.objective && (
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">Mục tiêu học: </span>
                {currentActivity.objective}
              </div>
            )}
          </div>

          {/* Nút hành động chính */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleStartSession(currentActivity.id)}
              disabled={starting}
              data-tour="today-start"
              className="flex-1 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-xs hover:shadow-sm disabled:opacity-50 text-center flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
            >
              {starting ? (
                <>
                  <RefreshIcon className="w-4 h-4 animate-spin" />
                  <span>Đang khởi tạo phiên...</span>
                </>
              ) : currentActivity.actionType === "continue_draft" ? (
                <>
                  <PenToolIcon className="w-4 h-4" />
                  <span>Tiếp tục bài đang dở ({targetMinutes} phút)</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  <span>Bắt đầu luyện tập ({targetMinutes} phút)</span>
                </>
              )}
            </button>

            <Link
              href={`/library/${currentActivity.id}`}
              className="px-5 py-3.5 border border-slate-200/90 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold rounded-xl text-center text-sm transition cursor-pointer flex items-center justify-center min-h-[48px]"
            >
              Xem đề bài
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-xs">
          <BookOpenIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">
            Chưa có bài học nào được duyệt trong Thư viện
          </h2>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Hệ thống chỉ gợi ý các bài học đã ở trạng thái <strong>Approved</strong>. Hãy vào Thư viện để duyệt bài học hoặc kiểm tra lại tệp manifest.yaml.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/library"
              className="text-xs font-semibold bg-teal-600 text-white px-4 py-2.5 rounded-xl hover:bg-teal-700 transition cursor-pointer min-h-[40px] flex items-center"
            >
              Mở Thư viện bài học →
            </Link>
            <Link
              href="/admin"
              className="text-xs font-semibold bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition border border-slate-200 cursor-pointer min-h-[40px] flex items-center gap-1.5"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Trang Quản trị</span>
            </Link>
          </div>
        </div>
      )}

      {/* 4. Danh sách bài thay thế nếu bấm "Đổi bài khác" */}
      {showAlternates && data?.alternateActivities && data.alternateActivities.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              Các bài học khả dụng khác
            </h3>
            <button
              onClick={() => setShowAlternates(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2 py-1 rounded cursor-pointer"
            >
              Đóng ✕
            </button>
          </div>

          <div className="space-y-2">
            {data.alternateActivities.map((alt) => {
              const modeInfo = MODE_CONFIG[alt.mode] || {
                label: alt.mode,
                badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
                icon: <BookOpenIcon className="w-3.5 h-3.5 text-slate-500" />,
              };
              const isCurrent = alt.id === currentActivity?.id;

              return (
                <div
                  key={alt.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                    isCurrent
                      ? "border-teal-500 bg-teal-50/40"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/80"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border inline-flex items-center gap-1 ${modeInfo.badgeClass}`}
                      >
                        {modeInfo.icon}
                        <span>{modeInfo.label}</span>
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {alt.title}
                      </span>
                    </div>
                    {alt.objective && (
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {alt.objective}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedActivity(alt);
                      setShowAlternates(false);
                    }}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 whitespace-nowrap px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-50 transition cursor-pointer min-h-[36px]"
                  >
                    Chọn bài này
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Khối liên kết nhanh: Tiến độ & Sổ từ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/progress"
          className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition flex items-center gap-4 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-teal-100">
            <BarChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition">
              Tiến độ học tập
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Phút thực học, chuỗi ngày, lỗi lặp & so sánh
            </p>
          </div>
        </Link>

        <Link
          href="/vocab"
          className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition flex items-center gap-4 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-indigo-100">
            <CardsIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition">
              Sổ từ vựng y khoa
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Từ đã lưu & ôn tập ngắt quãng Spaced Repetition
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
