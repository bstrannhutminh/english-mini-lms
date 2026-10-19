"use client";

interface EmbedErrorCardProps {
  startSeconds: number;
  endSeconds: number;
  /** Link mở video trên YouTube tại đúng mốc bắt đầu. */
  directYoutubeLink: string;
}

/**
 * Cảnh báo khi chủ video chặn nhúng (YouTube error 100/101/150):
 * học viên vẫn làm bài bình thường bằng cách mở video ở tab mới.
 */
export function EmbedErrorCard({
  startSeconds,
  endSeconds,
  directYoutubeLink,
}: EmbedErrorCardProps) {
  return (
    <div className="bg-indigo-950 px-5 py-6 text-center text-indigo-100">
      <div className="mb-2 text-3xl">🎬</div>
      <div className="mb-1.5 text-base font-bold">
        Video bị chủ sở hữu giới hạn phát nhúng trên web
      </div>
      <p className="mx-auto mb-3.5 max-w-md text-sm leading-relaxed text-indigo-200">
        Bạn vẫn hoàn toàn làm bài bình thường! Hãy mở video ở tab mới để xem
        đoạn từ <strong>{startSeconds}s đến {endSeconds}s</strong>, sau đó quay
        lại đây chọn đáp án.
      </p>
      <a
        href={directYoutubeLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white no-underline"
      >
        ▶ Mở video trên YouTube ({startSeconds}s - {endSeconds}s) ↗
      </a>
    </div>
  );
}
