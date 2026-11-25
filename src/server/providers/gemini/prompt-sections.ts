/**
 * Format các khối metadata bài học (rubric, feedback_guide) thành section
 * prompt cho evaluator Gemini — hàm thuần, không import client/fs.
 *
 * Rubric trong content/english-lab/rubrics/*.yaml có cấu trúc machine-readable:
 *   { id, title, description, dimensions: [{ key, name, weight, description }] }
 * được seed nạp nguyên vẹn vào activities.rubric_json. Trước đây rubric chỉ
 * được JSON.stringify thô vào prompt writing (in "null" khi thiếu), còn
 * feedback_guide không bao giờ vào prompt nào — file này chuẩn hoá cả hai.
 */

interface RubricDimension {
  key?: unknown;
  name?: unknown;
  weight?: unknown;
  description?: unknown;
}

interface RubricShape {
  title?: unknown;
  description?: unknown;
  dimensions?: unknown;
}

/** true khi rubric là object có mảng dimensions hợp lệ (cấu trúc chuẩn yaml). */
export function isStructuredRubric(rubric: unknown): boolean {
  if (!rubric || typeof rubric !== "object" || Array.isArray(rubric)) return false;
  const dims = (rubric as RubricShape).dimensions;
  return Array.isArray(dims) && dims.length > 0;
}

/**
 * Section "TIÊU CHÍ ĐÁNH GIÁ (RUBRIC)" — văn bản dễ đọc khi rubric đúng cấu
 * trúc machine-readable; fallback JSON dump cho shape lạ; "" khi không có
 * rubric (tránh in "null" vào prompt như trước).
 */
export function formatRubricSection(rubric: unknown): string {
  if (rubric === null || rubric === undefined) return "";

  if (!isStructuredRubric(rubric)) {
    // Shape lạ (rubric cũ/tự do): vẫn đưa vào prompt dạng JSON như hành vi cũ.
    return `TIÊU CHÍ ĐÁNH GIÁ (RUBRIC):\n${JSON.stringify(rubric, null, 2)}`;
  }

  const shape = rubric as RubricShape;
  const lines: string[] = [];
  const title = typeof shape.title === "string" && shape.title.trim()
    ? ` "${shape.title.trim()}"`
    : "";
  lines.push(`TIÊU CHÍ ĐÁNH GIÁ (RUBRIC${title}):`);

  if (typeof shape.description === "string" && shape.description.trim()) {
    lines.push(shape.description.trim());
  }

  const dims = (shape.dimensions as RubricDimension[]).filter(
    (d) => d && typeof d === "object"
  );
  lines.push("Các tiêu chí cần chấm (dùng key làm dimension trong scores):");
  for (const dim of dims) {
    const name = typeof dim.name === "string" && dim.name.trim()
      ? dim.name.trim()
      : String(dim.key ?? "tiêu chí");
    const key = typeof dim.key === "string" ? dim.key : "";
    const weight =
      typeof dim.weight === "number" && Number.isFinite(dim.weight)
        ? ` — trọng số ${Math.round(dim.weight * 100)}%`
        : "";
    const desc = typeof dim.description === "string" && dim.description.trim()
      ? `: ${dim.description.trim()}`
      : "";
    lines.push(`- ${name}${key ? ` [${key}]` : ""}${weight}${desc}`);
  }
  return lines.join("\n");
}

/**
 * Section "HƯỚNG DẪN GÓP Ý RIÊNG CỦA BÀI" từ feedback_guide do tác giả nội
 * dung viết (activities.feedback_guide). "" khi không có — prompt chỉ thêm
 * section này khi activity thật sự khai báo.
 */
export function formatFeedbackGuideSection(guide: string | null | undefined): string {
  const trimmed = guide?.trim();
  if (!trimmed) return "";
  return [
    "HƯỚNG DẪN GÓP Ý RIÊNG CỦA BÀI NÀY (do tác giả nội dung quy định — ưu tiên áp dụng):",
    trimmed,
  ].join("\n");
}
