/**
 * Wizard "Bài nghe YouTube" — trạng thái dùng chung giữa 4 bước và các
 * hàm validate (tái dùng validateTranscript/isYouTubeUrl/checkIdMatchesMode
 * của server để checklist khớp với duyệt thật).
 */
import {
  ACTIVITY_ID_PATTERN,
  SEGMENT_ID_PATTERN,
  SOURCE_ID_PATTERN,
  type FieldError,
} from "@/lib/content-constants";
import {
  isYouTubeUrl,
  validateTranscript,
} from "@/lib/content-fields";
import { checkIdMatchesMode } from "@/lib/content-validation";
import {
  validateListeningQuestions,
  type ListeningQuestion,
} from "@/lib/listening-questions";
import { slugifyTopic } from "@/lib/topics";

export type WizardMode = "listening" | "ielts-listening";

export interface QuestionDraft {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  /** Chuỗi số giây — rỗng = không đặt. */
  timestampRef: string;
}

export interface WizardData {
  // Bước 1 — Nguồn
  mode: WizardMode;
  title: string;
  topic: string;
  durationMinutes: string;
  youtubeUrl: string;
  startSeconds: string;
  endSeconds: string;
  sourceId: string;
  segmentId: string;
  activityId: string;
  idsTouched: boolean;
  // Bước 2 — Transcript
  transcript: string;
  verifiedTranscript: boolean;
  // Bước 3 — Câu hỏi
  questions: QuestionDraft[];
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

export function newQuestionDraft(index: number): QuestionDraft {
  return {
    id: `q${index + 1}`,
    prompt: "",
    options: [
      { id: "A", text: "" },
      { id: "B", text: "" },
      { id: "C", text: "" },
    ],
    correctOptionId: "A",
    explanation: "",
    timestampRef: "",
  };
}

export function newOptionId(options: { id: string }[]): string {
  const used = new Set(options.map((o) => o.id));
  return OPTION_LETTERS.find((l) => !used.has(l)) ?? `X${options.length}`;
}

/** Draft → shape mà server/màn nghe đọc (ListeningQuestion). */
export function draftToQuestion(q: QuestionDraft): ListeningQuestion {
  const t = q.timestampRef.trim();
  return {
    id: q.id.trim(),
    prompt: q.prompt.trim(),
    options: q.options.map((o) => ({ id: o.id.trim(), text: o.text.trim() })),
    correct_option_id: q.correctOptionId.trim(),
    ...(q.explanation.trim() ? { explanation: q.explanation.trim() } : {}),
    ...(t !== "" && !Number.isNaN(Number(t))
      ? { timestamp_reference: Number(t) }
      : {}),
  };
}

/* ── Gợi ý id ── */

export function suggestSourceId(title: string): string {
  const slug = slugifyTopic(title) || "video";
  return `src-yt-${slug}`.slice(0, 60);
}
export function suggestSegmentId(sourceId: string): string {
  return sourceId.replace(/^src/, "seg");
}
export function suggestActivityId(
  mode: WizardMode,
  existingIds: string[]
): string {
  const prefix = mode === "ielts-listening" ? "IL" : "L";
  const used = existingIds
    .filter((id) => id.startsWith(prefix) && /^\d+$/.test(id.slice(prefix.length)))
    .map((id) => Number(id.slice(prefix.length)));
  return `${prefix}${(used.length ? Math.max(...used) : 0) + 1}`;
}

/* ── Validate từng bước ── */

const intOrNull = (s: string) => (s.trim() === "" ? null : Number(s));

/** Bước 1 — Nguồn: URL YouTube + mốc giây + id hợp lệ. */
export function validateSourceStep(d: WizardData): FieldError[] {
  const errors: FieldError[] = [];
  if (!d.title.trim()) {
    errors.push({ field: "title", message: "bắt buộc" });
  }
  if (!d.youtubeUrl.trim() || !isYouTubeUrl(d.youtubeUrl.trim())) {
    errors.push({
      field: "youtubeUrl",
      message:
        "cần link YouTube hợp lệ (watch?v=…, youtu.be/…, embed/…; id 11 ký tự)",
    });
  }
  const start = intOrNull(d.startSeconds);
  const end = intOrNull(d.endSeconds);
  for (const [field, v] of [
    ["startSeconds", start],
    ["endSeconds", end],
  ] as const) {
    if (v !== null && (!Number.isInteger(v) || v < 0)) {
      errors.push({ field, message: "phải là số giây nguyên ≥ 0" });
    }
  }
  if (start !== null && end !== null && end <= start) {
    errors.push({
      field: "endSeconds",
      message: "giây kết thúc phải lớn hơn giây bắt đầu",
    });
  }
  if (!SOURCE_ID_PATTERN.test(d.sourceId)) {
    errors.push({ field: "sourceId", message: "dạng src-ten-nguon" });
  }
  if (!SEGMENT_ID_PATTERN.test(d.segmentId)) {
    errors.push({ field: "segmentId", message: "dạng seg-ten-doan" });
  }
  if (!ACTIVITY_ID_PATTERN.test(d.activityId)) {
    errors.push({ field: "activityId", message: "dạng L5 / IL5" });
  } else {
    const e = checkIdMatchesMode(d.activityId, d.mode);
    if (e) errors.push({ ...e, field: "activityId" });
  }
  const dur = intOrNull(d.durationMinutes);
  if (dur !== null && (!Number.isInteger(dur) || dur < 1 || dur > 240)) {
    errors.push({ field: "durationMinutes", message: "số nguyên 1–240" });
  }
  return errors;
}

/** Bước 2 — Transcript `start|end|text` mỗi dòng. */
export function validateTranscriptStep(d: WizardData): FieldError[] {
  if (!d.transcript.trim()) {
    return [{ field: "transcript", message: "dán transcript của video" }];
  }
  return validateTranscript(d.transcript).map((e) => ({
    ...e,
    field: "transcript",
  }));
}

/** Bước 3 — ít nhất 1 câu hỏi hợp lệ theo schema màn nghe. */
export function validateQuestionsStep(d: WizardData): FieldError[] {
  const qs = d.questions.map(draftToQuestion);
  const v = validateListeningQuestions(qs);
  if (qs.length === 0) {
    return [{ field: "questions", message: "cần ít nhất 1 câu hỏi" }];
  }
  const errors = v.errors.map((message) => ({ field: "questions", message }));
  // timestampRef không phải số bị bỏ lặng khi convert — báo lỗi thay vì mất dữ liệu
  d.questions.forEach((q, i) => {
    const t = q.timestampRef.trim();
    if (t !== "" && (Number.isNaN(Number(t)) || Number(t) < 0)) {
      errors.push({
        field: "questions",
        message: `questions[${i}].timestamp_reference: "${t}" phải là số giây ≥ 0`,
      });
    }
  });
  return errors;
}
