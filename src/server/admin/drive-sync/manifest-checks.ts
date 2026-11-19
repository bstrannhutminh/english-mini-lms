/**
 * Manifest-level checks (Phase 1a): pick approved activities and validate
 * manifest-internal references (topic keys, segment ids) before touching
 * Drive files or the DB.
 */
import { isValidTopicKey, UNCATEGORIZED_TOPIC } from "../../../lib/topics";
import type { ManifestActivity, ManifestData } from "../../seed/manifest-parser";

export function validateApprovedActivities(data: ManifestData): {
  approvedActivities: ManifestActivity[];
  validationErrors: string[];
} {
  const allActivities = data.activities ?? [];
  const allSegments = data.segments ?? [];
  const segmentMap = new Map(allSegments.map((s) => [s.id, s]));

  const approvedActivities = allActivities.filter(
    (act) => act.review_state === "approved"
  );
  const validationErrors: string[] = [];

  for (const act of approvedActivities) {
    if (act.topic !== undefined && act.topic !== null) {
      const topicKey = String(act.topic).trim();
      if (
        topicKey !== "" &&
        (!isValidTopicKey(topicKey) || topicKey === UNCATEGORIZED_TOPIC)
      ) {
        validationErrors.push(
          `Activity "${act.id}" ("${act.title}") có topic không hợp lệ: "${topicKey}"`
        );
      }
    }

    if (act.segment_ids && Array.isArray(act.segment_ids)) {
      for (const segId of act.segment_ids) {
        if (!segmentMap.has(segId)) {
          validationErrors.push(
            `Activity "${act.id}" tham chiếu segment không tồn tại trong manifest: "${segId}"`
          );
        }
      }
    }
  }

  return { approvedActivities, validationErrors };
}

/** Non-approved rows are skipped (never imported) — collected for reporting. */
export function collectSkippedIds(data: ManifestData): string[] {
  const skipped: string[] = [];
  for (const act of data.activities ?? []) {
    if (act.review_state !== "approved") skipped.push(`activity:${act.id}`);
  }
  for (const src of data.sources ?? []) {
    if (src.review_state !== "approved") skipped.push(`source:${src.id}`);
  }
  return skipped;
}
