/**
 * Reconcile review_state cho activities do seed quản lý (origin='seed').
 *
 * Vấn đề: seed chỉ upsert activity `approved` — activity bị gỡ khỏi manifest
 * hoặc đổi sang trạng thái khác approved vẫn nằm nguyên `approved` trong DB,
 * khiến learner vẫn thấy/học bài đáng lẽ đã rút.
 *
 * Luật (manifest là nguồn sự thật cho row origin='seed'):
 *  - Còn trong manifest nhưng KHÔNG approved → đặt review_state = trạng thái
 *    trong manifest (draft/reviewing/rejected/retired).
 *  - Không còn trong manifest → 'retired' (không xoá — giữ FK từ sessions cũ).
 *  - Đang approved trong manifest → bỏ qua (upsert chính đã xử lý).
 *  - Row admin đã sửa tay có origin='admin' nên không bao giờ lọt vào đây
 *    (seed.ts chỉ query origin='seed') — admin edit không bao giờ bị clobber.
 *
 * Thuần (pure) — không import db/env, unit-test hermetic được.
 */

export type SeedReviewState = "draft" | "reviewing" | "approved" | "rejected" | "retired";

export interface ManifestActivityState {
  id: string;
  reviewState: SeedReviewState;
}

export interface DbSeedActivityState {
  id: string;
  reviewState: SeedReviewState;
}

export interface ReconcileAction {
  id: string;
  nextReviewState: SeedReviewState;
  reason: "manifest_not_approved" | "missing_from_manifest";
}

export function computeSeedReviewStateReconcile(
  manifestActivities: ManifestActivityState[],
  dbSeedActivities: DbSeedActivityState[]
): ReconcileAction[] {
  const manifestById = new Map(manifestActivities.map((a) => [a.id, a.reviewState]));
  const actions: ReconcileAction[] = [];

  for (const row of dbSeedActivities) {
    const manifestState = manifestById.get(row.id);

    if (manifestState === undefined) {
      // Gỡ khỏi manifest → retire (trừ khi đã retired sẵn).
      if (row.reviewState !== "retired") {
        actions.push({ id: row.id, nextReviewState: "retired", reason: "missing_from_manifest" });
      }
      continue;
    }

    if (manifestState === "approved") {
      // Upsert chính lo phần này — reconcile không động vào.
      continue;
    }

    if (row.reviewState !== manifestState) {
      actions.push({ id: row.id, nextReviewState: manifestState, reason: "manifest_not_approved" });
    }
  }

  return actions;
}
