"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  createYoutubePlayer,
  extractVideoId,
  loadYoutubeIframeApi,
} from "./youtube-iframe";

/** Điều khiển từ bên ngoài (phím tắt trên desktop). */
export interface YouTubePlayerHandle {
  togglePlay: () => void;
  /** Tua tương đối (giây), luôn giữ trong đoạn [startSeconds, endSeconds]. */
  seekBy: (deltaSeconds: number) => void;
}

interface UseYouTubePlayerArgs {
  videoUrl: string;
  startSeconds: number;
  endSeconds: number;
  seekTo?: number | null;
  onTimeUpdate?: (currentSec: number) => void;
  controlRef?: React.Ref<YouTubePlayerHandle>;
}

export interface YouTubePlayerState {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isPlaying: boolean;
  isReady: boolean;
  embedError: boolean;
  currentTime: number;
  playbackRate: 0.75 | 1;
  videoId: string;
  directYoutubeLink: string;
  togglePlay: () => void;
  replaySegment: () => void;
  changeSpeed: (rate: 0.75 | 1) => void;
}

/**
 * Vòng đời YouTube IFrame player: nạp API, khởi tạo trong container ref,
 * poll thời gian để chặn phát vượt endSeconds, expose điều khiển cho UI
 * + phím tắt (controlRef). Tạo player/script nằm trong youtube-iframe.ts.
 */
export function useYouTubePlayer({
  videoUrl,
  startSeconds,
  endSeconds,
  seekTo,
  onTimeUpdate,
  controlRef,
}: UseYouTubePlayerArgs): YouTubePlayerState {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const checkTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<0.75 | 1>(1);
  const [embedError, setEmbedError] = useState(false);
  const [currentTime, setCurrentTime] = useState(startSeconds);
  const [isReady, setIsReady] = useState(false);

  const videoId = extractVideoId(videoUrl);

  // Theo dõi thời gian phát để chặn không phát vượt quá endSeconds
  const startPollingTime = useCallback(() => {
    if (checkTimeIntervalRef.current) clearInterval(checkTimeIntervalRef.current);
    checkTimeIntervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        try {
          const curr = playerRef.current.getCurrentTime();
          setCurrentTime(Math.round(curr));
          onTimeUpdate?.(curr);

          if (curr >= endSeconds) {
            playerRef.current.pauseVideo();
            playerRef.current.seekTo(startSeconds, true);
            setIsPlaying(false);
          }
        } catch {
          // player state might be transitioning
        }
      }
    }, 250);
  }, [endSeconds, onTimeUpdate, startSeconds]);

  const stopPollingTime = useCallback(() => {
    if (checkTimeIntervalRef.current) {
      clearInterval(checkTimeIntervalRef.current);
      checkTimeIntervalRef.current = null;
    }
  }, []);

  // Khởi tạo player (đã có YT API)
  const initPlayer = useCallback(() => {
    if (!containerRef.current) return;

    try {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = createYoutubePlayer({
        container: containerRef.current,
        videoId,
        startSeconds,
        endSeconds,
        onReady: () => {
          setIsReady(true);
          try {
            playerRef.current.seekTo(startSeconds, true);
          } catch {
            // ignore
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onStateChange: (event: any) => {
          // YT.PlayerState.PLAYING === 1
          if (event.data === 1) {
            setIsPlaying(true);
            startPollingTime();
          } else {
            setIsPlaying(false);
            stopPollingTime();
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (event: any) => {
          console.warn("YouTube player error:", event.data);
          // Mã lỗi 100/101/150 = không cho nhúng (not allowed to embed)
          if (event.data === 101 || event.data === 150 || event.data === 100) {
            setEmbedError(true);
          }
        },
      });
    } catch (err) {
      console.error("Lỗi khởi tạo YouTube player:", err);
      setEmbedError(true);
    }
  }, [endSeconds, startPollingTime, startSeconds, stopPollingTime, videoId]);

  // Nạp YouTube IFrame API script rồi init
  useEffect(() => {
    loadYoutubeIframeApi(initPlayer);
    return () => {
      stopPollingTime();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [initPlayer, stopPollingTime]);

  // Xử lý seek từ bên ngoài (ví dụ bấm câu Shadowing)
  useEffect(() => {
    if (seekTo !== undefined && seekTo !== null && playerRef.current && isReady) {
      try {
        playerRef.current.seekTo(seekTo, true);
        playerRef.current.playVideo();
      } catch {
        // ignore
      }
    }
  }, [seekTo, isReady]);

  // Điều khiển: Phát / Dừng
  const togglePlay = () => {
    if (!playerRef.current || !isReady) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        const curr = playerRef.current.getCurrentTime();
        if (curr < startSeconds || curr >= endSeconds) {
          playerRef.current.seekTo(startSeconds, true);
        }
        playerRef.current.playVideo();
      }
    } catch {
      // ignore
    }
  };

  // Điều khiển: Nghe lại toàn đoạn
  const replaySegment = () => {
    if (!playerRef.current || !isReady) return;
    try {
      playerRef.current.seekTo(startSeconds, true);
      playerRef.current.playVideo();
    } catch {
      // ignore
    }
  };

  // Điều khiển: Tua tương đối (±N giây), kẹp trong đoạn học
  const seekBy = (deltaSeconds: number) => {
    if (!playerRef.current || !isReady) return;
    try {
      const curr = playerRef.current.getCurrentTime();
      const target = Math.min(
        Math.max(startSeconds, endSeconds - 1),
        Math.max(startSeconds, curr + deltaSeconds),
      );
      playerRef.current.seekTo(target, true);
    } catch {
      // ignore
    }
  };

  // Cho phép trang cha gọi togglePlay/seekBy (phím tắt)
  useImperativeHandle(controlRef, () => ({ togglePlay, seekBy }));

  // Điều khiển: Đổi tốc độ (0.75x hoặc 1.0x)
  const changeSpeed = (rate: 0.75 | 1) => {
    if (!playerRef.current || !isReady) return;
    try {
      playerRef.current.setPlaybackRate(rate);
      setPlaybackRate(rate);
    } catch {
      // ignore
    }
  };

  const directYoutubeLink = `https://www.youtube.com/watch?v=${videoId}&t=${startSeconds}s`;

  return {
    containerRef,
    isPlaying,
    isReady,
    embedError,
    currentTime,
    playbackRate,
    videoId,
    directYoutubeLink,
    togglePlay,
    replaySegment,
    changeSpeed,
  };
}
