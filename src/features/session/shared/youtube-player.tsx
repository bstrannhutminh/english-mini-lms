"use client";

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
}

/**
 * Trình phát YouTube giới hạn trong đoạn [startSeconds, endSeconds]:
 * iframe 16:9 + thanh điều khiển (phát/dừng, nghe lại, tốc độ 0.75x/1x).
 * Logic IFrame API nằm trong use-youtube-player.ts.
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
  const { startSeconds, endSeconds } = props;

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-md">
      {embedError ? (
        <EmbedErrorCard
          startSeconds={startSeconds}
          endSeconds={endSeconds}
          directYoutubeLink={directYoutubeLink}
        />
      ) : (
        <>
          {/* Vùng chứa IFrame YouTube Player 16:9 */}
          <div className="relative h-0 overflow-hidden bg-black pb-[56.25%]">
            <div ref={containerRef} className="absolute left-0 top-0 h-full w-full" />
          </div>

          {/* Thanh công cụ điều khiển phát */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold text-white ${
                  isPlaying ? "bg-amber-500" : "bg-blue-600"
                }`}
              >
                {isPlaying ? "⏸ Dừng" : "▶ Phát"}
              </button>

              <button
                onClick={replaySegment}
                className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-100"
                title="Nghe lại đoạn từ đầu"
              >
                🔄 Nghe lại đoạn
              </button>
            </div>

            {/* Mốc thời gian & Tốc độ phát */}
            <div className="flex items-center gap-2.5">
              <span className="text-[13px] font-semibold text-slate-400">
                {currentTime}s / {endSeconds}s (Đoạn: {startSeconds}s - {endSeconds}s)
              </span>

              <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5">
                {([0.75, 1] as const).map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changeSpeed(rate)}
                    className={`rounded-md px-2 py-1 text-xs font-bold ${
                      playbackRate === rate ? "bg-blue-600 text-white" : "text-slate-400"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
