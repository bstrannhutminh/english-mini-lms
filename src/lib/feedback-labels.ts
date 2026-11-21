/**
 * Nhãn tiếng Việt cho khoá phân loại góp ý (`observation.category`) và tiêu chí
 * điểm ước tính luyện tập (`scores[].dimension`) do AI/rubric trả về bằng tiếng Anh.
 *
 * Hàm thuần, không phụ thuộc UI. Khoá được chuẩn hoá (không phân biệt hoa/thường,
 * khoảng trắng/gạch nối/"&"/"and" → "_") nên "Coherence and Cohesion",
 * "coherence_cohesion" và "coherence-cohesion" cho cùng một nhãn.
 * Khoá lạ → giữ nguyên chữ gốc, viết hoa chữ đầu (trung thực, không gán nhầm).
 */

const LABELS: Record<string, string> = {
  // Ngữ pháp
  grammar: "Ngữ pháp",
  grammatical_range_accuracy: "Ngữ pháp (đa dạng & chính xác)",
  // Từ vựng
  vocabulary: "Từ vựng",
  lexical: "Từ vựng",
  lexical_resource: "Từ vựng",
  academic_vocabulary: "Từ vựng học thuật",
  academic_medical_vocabulary: "Từ vựng học thuật & y khoa",
  terminology: "Thuật ngữ",
  // Giọng văn
  tone: "Giọng văn",
  register: "Giọng văn",
  tone_vocabulary: "Giọng văn & từ vựng",
  tone_formal_vocabulary: "Giọng văn & từ vựng trang trọng",
  // Cấu trúc / mạch lạc
  structure: "Cấu trúc",
  organization: "Cấu trúc",
  organisation: "Cấu trúc",
  structure_cohesion: "Cấu trúc & liên kết",
  coherence: "Mạch lạc",
  cohesion: "Mạch lạc",
  coherence_cohesion: "Mạch lạc",
  // Độ rõ / diễn đạt
  clarity: "Độ rõ ràng",
  clarity_purpose: "Độ rõ ràng & mục đích",
  expression: "Cách diễn đạt",
  conciseness: "Độ cô đọng",
  conciseness_synthesis: "Cô đọng & tổng hợp",
  // Đáp ứng đề
  task: "Đáp ứng đề",
  task_response: "Đáp ứng đề",
  task_achievement: "Đáp ứng đề",
  // Nói
  fluency: "Độ trôi chảy",
  fluency_coherence: "Trôi chảy & mạch lạc",
  pronunciation: "Phát âm",
  // Đọc–dịch
  accuracy: "Độ trung thành với bản gốc",
  fidelity: "Độ trung thành với bản gốc",
  fidelity_accuracy: "Độ trung thành với bản gốc",
  fidelity_core_points: "Độ trung thành & ý chính",
  // Nghe
  comprehension: "Mức hiểu bài",
  listening_comprehension: "Mức hiểu bài nghe",
  // Chính tả / dấu câu
  spelling: "Chính tả",
  punctuation: "Dấu câu",
  // Nhóm mặc định của server khi thiếu category
  other: "Khác",
  "khác": "Khác",
};

/** "Tone & Formal-Vocabulary " → "tone_formal_vocabulary". */
export function normalizeFeedbackKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/&/g, " ")
    .split(/[\s_\-/]+/)
    .filter((part) => part.length > 0 && part !== "and")
    .join("_");
}

/** Chữ gốc dễ đọc: "self_correction" → "Self correction". */
function humanizeKey(key: string): string {
  const text = key.trim().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  return text ? text.charAt(0).toLocaleUpperCase("vi-VN") + text.slice(1) : "";
}

function lookupLabel(key: string | null | undefined, emptyFallback: string): string {
  if (!key || !key.trim()) return emptyFallback;
  return LABELS[normalizeFeedbackKey(key)] ?? humanizeKey(key);
}

/** true khi khoá có nhãn tiếng Việt đã biết (không phải fallback). */
export function hasFeedbackLabel(key: string | null | undefined): boolean {
  return Boolean(key && LABELS[normalizeFeedbackKey(key)]);
}

/** Nhãn nhóm lỗi của một góp ý: "tone" → "Giọng văn". Thiếu khoá → "Khác". */
export function feedbackCategoryLabel(category: string | null | undefined): string {
  return lookupLabel(category, "Khác");
}

/** Nhãn tiêu chí điểm ước tính luyện tập: "task_response" → "Đáp ứng đề". */
export function scoreCriterionLabel(dimension: string | null | undefined): string {
  return lookupLabel(dimension, "Tiêu chí");
}
