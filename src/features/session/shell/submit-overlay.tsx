"use client";

/** Overlay toàn màn hình trong lúc chờ AI chấm (port từ writing view). */
export function SubmitOverlay({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/75 p-6 text-center text-white backdrop-blur-sm">
      <div
        aria-hidden
        className="mb-5 h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-sky-400"
      />
      <h2 className="mb-2 text-xl font-bold">{title}</h2>
      <p className="mb-4 max-w-[380px] text-sm leading-relaxed text-slate-300">
        {description}
      </p>
      <div className="rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] text-slate-400">
        Vui lòng không đóng trình duyệt
      </div>
    </div>
  );
}
