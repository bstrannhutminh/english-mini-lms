import { NextResponse } from "next/server";
import { withLearner, ApiRouteError } from "@/server/http";
import { uploadLearnerMedia } from "@/server/media/service";

/**
 * POST /api/v1/media — upload file âm thanh (multipart/form-data).
 * MIME/size/thời lượng kiểm trong media service (audio ≤5', ≤20MB).
 * Contract: uploadMediaResponseSchema (snake_case).
 */
export const POST = withLearner(async ({ req, learner }) => {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const durationRaw =
    formData.get("durationSeconds") || formData.get("duration_seconds");
  const durationParsed = durationRaw ? parseInt(String(durationRaw), 10) : NaN;
  const durationSeconds = Number.isFinite(durationParsed)
    ? durationParsed
    : undefined;

  if (!file) {
    throw new ApiRouteError(
      400,
      "invalid_request",
      "Vui lòng chọn hoặc đính kèm tệp âm thanh 'file'"
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const media = await uploadLearnerMedia(
    learner.id,
    buffer,
    file.type || "audio/webm",
    durationSeconds
  );

  return NextResponse.json(
    {
      media_id: media.id,
      status: media.status,
      storage_key: media.storageKey,
      size_bytes: media.sizeBytes,
    },
    { status: 201 }
  );
});
