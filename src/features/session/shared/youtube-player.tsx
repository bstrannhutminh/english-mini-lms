"use client";

import { Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import { EmbedErrorCard } from "./embed-error-card";
import { useYouTubePlayer, type YouTubePlayerHandle } from "./use-youtube-player";

export type { YouTubePlayerHandle };

interface YouTubePlayerProps {
  videoUrl: string;
  startSeconds: number;
  endSeconds: number;
  seekTo?: number | null;
  onTimeUpdate?: (currentSec: number) => void;
  controlRef?: React.Ref<YouTubePlayerHandle>;
  /** Lớp bố cục cho khung video (thứ tự/khoảng cách do panel quyết định). */
  className?: string;
  /** Lớp bố cục cho thanh điều khiển — panel có thể cho dính dưới header ở mobile. */
  controlsClassName?: string;
}

/**
 * Trình phát YouTube giới hạn trong đoạn [startSeconds, endSeconds].
 * Trả về HAI phần tử liền nhau: khung video 16:9 và thanh điều khiển một hàng
 * (Phát/Dừng · Nghe lại · thời gian · tốc độ, mọi nút ≥ 44px). Tách đôi để
 * panel nghe cho thanh điều khiển dính dưới header trên mobile — vẫn bấm
 * phát/nghe lại được khi đang cuộn xuống câu hỏi.
 */
export function YouTubePlayer(props: YouTubePlayerProps) {
  const {
    containerRef,
    isPlaying,
    embedError,
    currentTime,
    playbackRate,
    directYoutubeLink,
    togglePlay,
    replaySegment,
    changeSpeed,
  } = useYouTubePlayer(props);
  const { startSeconds, endSeconds, className, controlsClassName } = props;

  if (embedError) {
    return (
      <div className={cn("overflow-hidden rounded-2xl border border-border bg-surface shadow-card", className)}>
        <EmbedErrorCard
          startSeconds={startSeconds}
          endSeconds={endSeconds}
          directYoutubeLink={directYoutubeLink}
        />
      </div>
    );
  }

  const span = Math.max(1, endSeconds - startSeconds);
  const played = Math.min(100, Math.max(0, ((currentTime - startSeconds) / span) * 100));

  return (
    <>
      <div className={cn("overflow-hidden rounded-t-2xl border border-b-0 border-border bg-black", className)}>
        <div className="relative h-0 overflow-hidden pb-[56.25%]">
          {/* YT.Player chèn iframe 640×390 cố định — ép lấp đầy khung 16:9 để không bị cắt ở mobile. */}
          <div ref={containerRef} className="absolute left-0 top-0 h-full w-full [&_iframe]:h-full [&_iframe]:w-full" />
        </div>
      </div>

      <div className={controlsClassName}>
        <div className="overflow-hidden rounded-b-2xl border border-border bg-surface shadow-card">
          <div aria-hidden="true" className="h-1 w-full bg-surface-subtle">
            <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${played}%` }} />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Dừng" : "Phát"}
              className="pressable inline-flex min-h-11 min-w-14 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-semibold text-white hover:bg-primary-dark"
            >
              <Icon name={isPlaying ? "pause" : "play"} className="h-4 w-4" />
              <span aria-hidden="true" className="hidden min-[420px]:inline">{isPlaying ? "Dừng" : "Phát"}</span>
            </button>

            <button
              type="button"
              onClick={replaySegment}
              aria-label="Nghe lại đoạn từ đầu"
              title="Nghe lại đoạn từ đầu"
              className="pressable inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-base font-medium text-text-secondary hover:bg-surface-muted hover:text-text"
            >
              <Icon name="refresh" className="h-4 w-4" />
              <span className="hidden sm:inline lg:hidden xl:inline">Nghe lại</span>
            </button>

            <span className="ml-auto hidden min-w-0 truncate text-sm font-medium tabular-nums text-text-secondary min-[360px]:inline">
              {currentTime}s / {endSeconds}s
              <span className="hidden text-text-muted sm:inline lg:hidden"> ({startSeconds}s–{endSeconds}s)</span>
            </span>

            <div
              role="group"
              aria-label="Tốc độ phát"
              className="ml-auto flex shrink-0 rounded-xl bg-surface-subtle p-0.5 min-[360px]:ml-0"
            >
              {([0.75, 1] as const).map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => changeSpeed(rate)}
                  aria-pressed={playbackRate === rate}
                  className={cn(
                    "pressable min-h-11 min-w-11 cursor-pointer rounded-[0.625rem] px-2 text-base font-medium",
                    playbackRate === rate
                      ? "bg-surface text-primary-dark shadow-card ring-1 ring-inset ring-border"
                      : "text-text-secondary hover:text-text"
                  )}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
