/**
 * Helpers thuần cho wizard 4 bước: khởi tạo dữ liệu + upsert nguồn/segment/
 * activity. Chỉ cập nhật lại đối tượng đã tạo trong lần nhập hiện tại.
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

/** Một ID đã có từ trước không được ghi đè dưới thao tác tạo mới. */
export async function upsert(
  createFn: (body: unknown) => Promise<unknown>,
  updateFn: (id: string, body: unknown) => Promise<unknown>,
  id: string,
  body: Record<string, unknown>,
  createdIds: Set<string> = new Set()
): Promise<void> {
  if (createdIds.has(id)) {
    await updateFn(id, body);
    return;
  }
  try {
    await createFn({ ...body, id });
    createdIds.add(id);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 409) {
      throw new ApiClientError(
        "conflict",
        `Mã “${id}” đã tồn tại. Chọn mã mới hoặc mở nội dung hiện có để chỉnh sửa.`,
        409
      );
    }
    throw err;
  }
}
