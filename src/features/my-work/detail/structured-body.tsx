import type { ReactNode } from "react";

/**
 * Hiển thị nội dung bài nộp:
 * - Bài Đọc–dịch lưu body dạng JSON {mainIdea, translation, keyTerms}
 *   → render 3 phần có nhãn.
 * - Còn lại (viết/nói) → plain text giữ xuống dòng.
 */
export function StructuredBody({ body }: { body: string | null }) {
  if (!body) {
    return <p className="text-sm italic text-text-muted">(Không có nội dung)</p>;
  }

  const parsed = tryParseReadingBody(body);
  if (!parsed) {
    return <div className="whitespace-pre-wrap">{body}</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {parsed.mainIdea ? (
        <Section label="1. Ý chính của đoạn">{parsed.mainIdea}</Section>
      ) : null}
      {parsed.translation ? (
        <Section label="2. Bản dịch tiếng Việt" preserve>
          {parsed.translation}
        </Section>
      ) : null}
      {parsed.keyTerms ? (
        <Section label="3. Ba thuật ngữ tự giải thích" preserve>
          {parsed.keyTerms}
        </Section>
      ) : null}
    </div>
  );
}

interface ReadingBody {
  mainIdea?: string;
  translation?: string;
  keyTerms?: string;
}

function tryParseReadingBody(body: string): ReadingBody | null {
  try {
    const parsed: unknown = JSON.parse(body);
    if (
      parsed &&
      typeof parsed === "object" &&
      ("translation" in parsed || "mainIdea" in parsed || "keyTerms" in parsed)
    ) {
      return parsed as ReadingBody;
    }
  } catch {
    // plain text — không phải JSON
  }
  return null;
}

function Section({
  label,
  preserve = false,
  children,
}: {
  label: string;
  preserve?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold text-text-secondary">{label}</p>
      <div
        className={`rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text ${
          preserve ? "whitespace-pre-wrap" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
