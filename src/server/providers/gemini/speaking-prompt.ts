/**
 * Prompt + schema của evaluator Speaking — tách khỏi speaking.ts (giữ file
 * ≤200 dòng). Thuần text/builder, không import client Gemini nên unit-test
 * hermetic được (xem tests/unit/providers/eval-prompts.test.ts).
 */
import { formatFeedbackGuideSection, formatRubricSection } from "./prompt-sections";

export const SPEAKING_SYSTEM_INSTRUCTION = `Bạn là Giảng viên Cố vấn Speaking tiếng Anh Y khoa & Giao tiếp Hội nghị dành cho Bác sĩ Minh (chuyên ngành Cơ xương khớp và can thiệp giảm đau siêu âm).
Nhiệm vụ: Đánh giá bài nói (Speaking / Shadowing) từ âm thanh trực tiếp của bác sĩ.

QUY TẮC BẮT BUỘC:
1. Bóc băng chính xác từng từ mà người nói đã phát âm thành văn bản tiếng Anh vào trường "transcript". Transcript PHẢI xuất phát từ âm thanh thật — tuyệt đối không chép từ ghi chú/dàn ý người học tự gõ hay transcript gốc của bài học (nếu có trong ngữ cảnh).
2. Tối đa 3 observations ưu tiên (observations.length <= 3): tập trung vào từ vựng chuyên ngành, cấu trúc diễn đạt, hoặc lỗi phát âm/ngắt nghỉ quan trọng nhất. Mỗi observation phải có category (pronunciation, grammar, vocabulary, fluency, tone, structure).
3. Đánh giá phát âm (pronunciation):
   - Nếu có âm thanh: status là "assessed", nhận xét cụ thể về trọng âm từ (word stress), ngữ điệu (intonation), hoặc các phụ âm cuối (ending sounds).
   - TUYỆT ĐỐI: Nếu không có file âm thanh thật (hoặc đầu vào chỉ là văn bản), trường pronunciation.status BẮT BUỘC phải là "not_assessable" và notes nêu rõ: "Không thể chấm phát âm do thiếu dữ liệu âm thanh thực tế."
4. Trường retry_prompt: Đưa ra 1 thử thách nói lại ngắn gọn, trọng tâm vào điểm cần cải thiện nhất.
5. Scores: Chỉ mang kind "practice_estimate" cho các tiêu chí như fluency, pronunciation, vocabulary. Tuyệt đối không sinh "official IELTS band".
6. Limitations: Ghi rõ nhận xét chỉ phục vụ mục đích rèn luyện phản xạ ngôn ngữ.
7. Trả về đúng định dạng JSON tuân thủ schema.`;

export const speakingJsonSchema = {
  type: "object",
  properties: {
    transcript: { type: "string" },
    transcript_confidence: { type: "number" },
    observations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: "Phân loại lỗi: pronunciation | grammar | vocabulary | fluency | tone | structure",
          },
          location: { type: "string" },
          original: { type: "string" },
          issue: { type: "string" },
          suggestion: { type: "string" },
          example: { type: "string" },
          retry_prompt: { type: "string" },
        },
        required: ["location", "original", "issue", "suggestion", "example", "retry_prompt"],
      },
      maxItems: 3,
    },
    pronunciation: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["assessed", "not_assessable"] },
        notes: { type: "string" },
      },
      required: ["status", "notes"],
    },
    retry_prompt: { type: "string" },
    strengths: { type: "array", items: { type: "string" } },
    next_action: { type: "string" },
    limitations: { type: "string" },
    scores: {
      type: "array",
      items: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["practice_estimate"] },
          dimension: { type: "string" },
          value: { type: "number" },
          note: { type: "string" },
        },
        required: ["kind", "dimension", "value"],
      },
    },
  },
  required: ["transcript", "observations", "pronunciation", "retry_prompt", "limitations"],
};

/**
 * Ngữ cảnh chấm speaking — phân biệt RÕ 3 loại văn bản từng bị dán nhầm
 * nhãn "TRANSCRIPT CHUẨN SHADOWING" khiến AI chấm méo:
 *  - referenceTranscript: transcript GỐC của bài học (câu mẫu shadowing) —
 *    do content cung cấp, không phải bài của người học.
 *  - learnerText: ghi chú/dàn ý/bản gõ tay do chính người học viết — chỉ là
 *    ý định nói, KHÔNG phải transcript của bản ghi âm.
 *  - transcript trong output: do AI tự bóc băng từ audio.
 */
export interface SpeakingEvalContext {
  referenceTranscript?: string;
  learnerText?: string;
  feedbackGuide?: string | null;
  rubric?: unknown;
}

/** Các section metadata chung (rubric + feedback_guide) — "" khi không có. */
function evalMetaSections(context: SpeakingEvalContext): string {
  return [
    formatRubricSection(context.rubric),
    formatFeedbackGuideSection(context.feedbackGuide),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Prompt nhánh CÓ audio thật — hàm thuần để unit-test nhãn phân biệt. */
export function buildSpeakingAudioPrompt(
  prompt: string,
  context: SpeakingEvalContext = {}
): string {
  const sections = [
    `ĐỀ BÀI NÓI / BỐI CẢNH HỘI NGHỊ:\n${prompt}`,
    context.referenceTranscript?.trim()
      ? `TRANSCRIPT GỐC CỦA BÀI HỌC — văn bản chuẩn người học đang nhại theo (shadowing). Đây KHÔNG phải bài nói của người học, chỉ dùng để đối chiếu độ chính xác:\n${context.referenceTranscript.trim()}`
      : "",
    context.learnerText?.trim()
      ? `GHI CHÚ / DÀN Ý DO NGƯỜI HỌC TỰ GÕ TRƯỚC KHI NÓI — chỉ tham khảo ý định trình bày; TUYỆT ĐỐI không được coi là transcript của bản ghi âm và không chép vào transcript:\n${context.learnerText.trim()}`
      : "",
    evalMetaSections(context),
    "Hãy lắng nghe trực tiếp tệp âm thanh đính kèm, bóc băng chính xác lời người học nói trong audio vào transcript, đánh giá phát âm (pronunciation), nhận xét tối đa 3 điểm ưu tiên và trả về JSON theo schema.",
  ];
  return sections.filter(Boolean).join("\n\n");
}

/** Prompt nhánh text-only (không audio) — hàm thuần để unit-test nhãn phân biệt. */
export function buildSpeakingTextOnlyPrompt(
  prompt: string,
  context: SpeakingEvalContext = {}
): string {
  const sections = [
    `ĐỀ BÀI HOẶC NGỮ CẢNH:\n${prompt}`,
    context.referenceTranscript?.trim()
      ? `TRANSCRIPT GỐC THAM CHIẾU CỦA BÀI HỌC — văn bản mẫu do content cung cấp, KHÔNG phải bài làm của người học:\n${context.referenceTranscript.trim()}`
      : "",
    context.learnerText?.trim()
      ? `BÀI LÀM DẠNG VĂN BẢN DO NGƯỜI HỌC TỰ GÕ — đây là nội dung cần chấm (từ vựng, cấu trúc, độ mạch lạc):\n${context.learnerText.trim()}`
      : "",
    evalMetaSections(context),
    `LƯU Ý: Người dùng nộp bài dạng văn bản, KHÔNG CÓ FILE ÂM THANH THỰC TẾ.
- Bắt buộc đặt pronunciation.status = "not_assessable".
- Trường transcript trong JSON trả về: chép lại nguyên văn bài làm dạng văn bản của người học phía trên.`,
  ];
  return sections.filter(Boolean).join("\n\n");
}
