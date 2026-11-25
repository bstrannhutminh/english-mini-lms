"use client";

/**
 * Lớp mỏng quanh YouTube IFrame API: nạp script toàn cục một lần và tạo
 * player trong một div con của container. Không giữ state React.
 */

export interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  setPlaybackRate: (rate: number) => void;
  destroy: () => void;
}

export interface YTPlayerEvent {
  data: number;
  target?: YTPlayer;
}

interface YTPlayerOptions {
  videoId: string;
  playerVars: Record<string, number>;
  events: {
    onReady: () => void;
    onStateChange: (event: YTPlayerEvent) => void;
    onError: (event: YTPlayerEvent) => void;
  };
}

export interface YTNamespace {
  Player: new (elementId: string, options: YTPlayerOptions) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** Trích xuất YouTube video ID từ nhiều dạng URL (share/watch/embed). */
export function extractVideoId(url: string): string {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : url;
}

/** Chèn script iframe_api (1 lần) rồi gọi onReady khi API sẵn sàng. */
export function loadYoutubeIframeApi(onReady: () => void): void {
  if (typeof window === "undefined") return;
  if (window.YT) {
    setTimeout(onReady, 0);
    return;
  }
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
  window.onYouTubeIframeAPIReady = onReady;
}

interface CreatePlayerArgs {
  container: HTMLDivElement;
  videoId: string;
  startSeconds: number;
  endSeconds: number;
  onReady: () => void;
  onStateChange: (event: YTPlayerEvent) => void;
  onError: (event: YTPlayerEvent) => void;
}

/**
 * Tạo YT.Player trong container (xóa nội dung cũ + div con mới có id duy nhất).
 * Trả instance player hoặc null khi API chưa sẵn sàng.
 */
export function createYoutubePlayer({
  container,
  videoId,
  startSeconds,
  endSeconds,
  onReady,
  onStateChange,
  onError,
}: CreatePlayerArgs): YTPlayer | null {
  if (!window.YT || !window.YT.Player) return null;

  const playerElementId = `yt-player-${Math.random().toString(36).substring(2, 9)}`;
  const innerDiv = document.createElement("div");
  innerDiv.id = playerElementId;
  container.innerHTML = "";
  container.appendChild(innerDiv);

  return new window.YT.Player(playerElementId, {
    videoId,
    playerVars: {
      start: startSeconds,
      end: endSeconds,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      enablejsapi: 1,
    },
    events: { onReady, onStateChange, onError },
  });
}
