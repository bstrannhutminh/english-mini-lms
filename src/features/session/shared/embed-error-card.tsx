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
    <div className="bg-surface-muted px-5 py-6 text-base text-text">
      <div className="mb-1.5 text-base font-bold">
        Video bị chủ sở hữu giới hạn phát nhúng trên web
      </div>
      <p className="mb-4 max-w-prose text-base leading-relaxed text-text-secondary">
        Mở video ở tab mới để xem
        đoạn từ <strong>{startSeconds}s đến {endSeconds}s</strong>, sau đó quay
        lại đây chọn đáp án.
      </p>
      <a
        href={directYoutubeLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-medium text-white no-underline hover:bg-primary-dark"
      >
        ▶ Mở video trên YouTube ({startSeconds}s - {endSeconds}s) ↗
      </a>
    </div>
  );
}
