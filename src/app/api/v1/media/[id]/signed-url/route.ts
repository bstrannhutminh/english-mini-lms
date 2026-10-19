import { NextResponse } from "next/server";
import { withLearner } from "@/server/http";
import { getMediaObject, getMediaSignedUrl } from "@/server/media/service";

interface RouteParams {
  id: string;
}

/**
 * GET /api/v1/media/[id]/signed-url — URL nghe lại ngắn hạn (10 phút)
 * cho file audio trong bucket private (dùng ở /my-work so sánh 2 bản).
 * Contract: mediaSignedUrlResponseSchema (snake_case).
 */
export const GET = withLearner<RouteParams>(async ({ learner, params }) => {
  const media = await getMediaObject(params.id, learner.id);
  const signedUrl = await getMediaSignedUrl(media.storageKey, 600); // 10 phút

  return NextResponse.json({
    media_id: media.id,
    signed_url: signedUrl,
    expires_in_seconds: 600,
  });
});
