/**
 * Định dạng thời điểm nộp bài theo giờ Việt Nam (cố định Asia/Ho_Chi_Minh).
 * Cố định múi giờ để HTML do server render (Vercel chạy UTC) khớp với
 * trình duyệt của người học — tránh lệch hydration khi danh sách render sẵn.
 */
const PARTS_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hourCycle: "h23",
});

export interface SubmittedAtParts {
  /** "08:47" */
  time: string;
  /** "19/11/2026" */
  date: string;
}

export function submittedAtParts(value: string | Date): SubmittedAtParts | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts: Record<string, string> = {};
  for (const part of PARTS_FORMATTER.formatToParts(date)) {
    parts[part.type] = part.value;
  }
  return {
    time: `${parts.hour}:${parts.minute}`,
    date: `${parts.day}/${parts.month}/${parts.year}`,
  };
}

/** "08:47 · 19/11/2026" — chuỗi rỗng nếu ngày không hợp lệ. */
export function formatSubmittedAt(value: string | Date): string {
  const parts = submittedAtParts(value);
  return parts ? `${parts.time} · ${parts.date}` : "";
}
