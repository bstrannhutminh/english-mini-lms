"use client";

import { Icon } from "@/components/ui";
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
 * iframe 16:9 + thanh điều khiển đồng bộ Teal/Slate, touch target ≥ 44px.
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
    <div className="mb-4 overflow-hidden rounded-xl border border-border bg-surface">
      {embedError ? (
        <EmbedErrorCard
          startSeconds={startSeconds}
          endSeconds={endSeconds}
          directYoutubeLink={directYoutubeLink}
        />
      ) : (
        <>
          <div className="relative h-0 overflow-hidden bg-black pb-[56.25%]">
            <div
              ref={containerRef}
              className="absolute left-0 top-0 h-full w-full"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-4 text-base font-semibold text-white transition ${
                  isPlaying
                    ? "bg-primary-dark hover:bg-primary"
                    : "bg-primary hover:bg-primary-dark"
                }`}
              >
                <Icon name={isPlaying ? "pause" : "play"} className="h-4 w-4" />
                <span>{isPlaying ? "Dừng" : "Phát"}</span>
              </button>

              <button
                type="button"
                onClick={replaySegment}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3.5 text-base font-medium text-text-secondary transition hover:bg-surface-muted"
                title="Nghe lại đoạn từ đầu"
              >
                <Icon name="refresh" className="h-4 w-4" />
                <span>Nghe lại</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-base font-medium tabular-nums text-text-secondary">
                {currentTime}s / {endSeconds}s ({startSeconds}s–{endSeconds}s)
              </span>

              <div
                role="group"
                aria-label="Tốc độ phát"
                className="flex rounded-lg border border-border bg-surface-muted p-0.5"
              >
                {([0.75, 1] as const).map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => changeSpeed(rate)}
                    aria-pressed={playbackRate === rate}
                    className={`min-h-11 min-w-11 cursor-pointer rounded-md px-2.5 text-base font-medium transition ${
                      playbackRate === rate
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:text-text"
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
