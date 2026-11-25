import { Fragment, type ReactNode } from "react";

/**
 * MarkdownText — render Markdown TỐI GIẢN, an toàn, không dependency.
 *
 * Hỗ trợ: đoạn (tách bởi dòng trống), **in đậm**, *nghiêng*, danh sách
 * "- "/"* ", và tiêu đề "#"–"###" (hiển thị như đoạn đậm). Mọi thứ khác
 * (link, code, HTML) hiện nguyên văn — React tự escape nên an toàn với
 * mọi nội dung nhập từ admin.
 *
 * Dùng cho promptText/đề bài do admin soạn bằng Markdown nhẹ.
 *
 * Ảnh độc lập "![alt](src)" chiếm cả block được render thành <img>
 * khi src là đường dẫn nội bộ "/..." (không phải "//...") hoặc https://.
 */
export function MarkdownText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        // Ảnh độc lập: ![alt](src) chiếm cả block → <img>, chỉ khi src an toàn
        // (đường dẫn nội bộ "/..." không phải "//..." hoặc https://).
        const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (image) {
          const [, alt, src] = image;
          const safeSrc =
            (src.startsWith("/") && !src.startsWith("//")) ||
            src.startsWith("https://");
          if (safeSrc) {
            return (
              // eslint-disable-next-line @next/next/no-img-element -- src động do admin soạn (URL ngoài tuỳ ý), next/image cần kích thước cố định hoặc whitelist domain
              <img
                key={i}
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                className="my-2 w-full rounded-lg"
              />
            );
          }
        }
        const isList = lines.every((l) => /^\s*[-*]\s+/.test(l));
        if (isList) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        const heading = block.match(/^(#{1,3})\s+([^\n]+)/);
        if (heading) {
          return (
            <Fragment key={i}>
              <p className="font-bold">{inline(heading[2])}</p>
              {lines.length > 1 && <MarkdownText text={lines.slice(1).join("\n")} />}
            </Fragment>
          );
        }
        return (
          <p key={i} className={i > 0 ? "mt-2" : undefined}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

/** **đậm** và *nghiêng* trong một dòng → ReactNode; còn lại nguyên văn. */
function inline(line: string): ReactNode {
  return line
    .split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g)
    .filter(Boolean)
    .map((part, k) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return <strong key={k}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <em key={k}>{part.slice(1, -1)}</em>;
      }
      return <Fragment key={k}>{part}</Fragment>;
    });
}
