/**
 * Helpers thuần cho wizard 4 bước: khởi tạo dữ liệu + upsert nguồn/segment/
 * activity (tạo mới; 409 "đã tồn tại" → PATCH — idempotent khi bấm lại).
 */
import { ApiClientError } from "@/lib/api-client";
import {
  newQuestionDraft,
  suggestActivityId,
  suggestSegmentId,
  suggestSourceId,
  type WizardData,
} from "./wizard-types";

export const intOrNull = (s: string) => (s.trim() === "" ? null : Number(s));

export function initialData(existingIds: string[]): WizardData {
  const sourceId = suggestSourceId("bai-nghe-moi");
  return {
    mode: "listening",
    title: "",
    topic: "",
    durationMinutes: "",
    youtubeUrl: "",
    startSeconds: "",
    endSeconds: "",
    sourceId,
    segmentId: suggestSegmentId(sourceId),
    activityId: suggestActivityId("listening", existingIds),
    idsTouched: false,
    transcript: "",
    verifiedTranscript: false,
    questions: [newQuestionDraft(0)],
  };
}

/** Tạo mới; nếu đã tồn tại (409) thì PATCH nội dung — an toàn để bấm lại. */
export async function upsert(
  createFn: (body: unknown) => Promise<unknown>,
  updateFn: (id: string, body: unknown) => Promise<unknown>,
  id: string,
  body: Record<string, unknown>
): Promise<void> {
  try {
    await createFn({ ...body, id });
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 409) {
      await updateFn(id, body);
      return;
    }
    throw err;
  }
}
