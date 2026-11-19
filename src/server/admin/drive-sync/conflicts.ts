/**
 * Conflict closure (Phase 1b): a row must never be overwritten by Drive sync
 * when origin='admin' OR when an admin activity references it (segment or its
 * parent source). Produces the blocked id sets + human-readable conflicts.
 */
import { eq, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { activities, sourceSegments, sources } from "../../../db/schema";
import type { ManifestData, ManifestActivity } from "../../seed/manifest-parser";
import type { SyncConflict } from "./types";

export interface OriginMaps {
  activityOrigins: Map<string, string>;
  sourceOrigins: Map<string, string>;
  segmentOrigins: Map<string, string>;
}

export interface BlockedIds {
  blockedActivityIds: Set<string>;
  blockedSegmentIds: Set<string>;
  blockedSourceIds: Set<string>;
}

export interface ConflictClosure {
  origins: OriginMaps;
  blocked: BlockedIds;
  conflicts: SyncConflict[];
}

export async function getExistingOrigins(): Promise<OriginMaps> {
  const [existingActivities, existingSources, existingSegments] =
    await Promise.all([
      db.select({ id: activities.id, origin: activities.origin }).from(activities),
      db.select({ id: sources.id, origin: sources.origin }).from(sources),
      db
        .select({ id: sourceSegments.id, origin: sourceSegments.origin })
        .from(sourceSegments),
    ]);

  return {
    activityOrigins: new Map(
      existingActivities.map((a) => [a.id, a.origin ?? "seed"])
    ),
    sourceOrigins: new Map(
      existingSources.map((s) => [s.id, s.origin ?? "seed"])
    ),
    segmentOrigins: new Map(
      existingSegments.map((s) => [s.id, s.origin ?? "seed"])
    ),
  };
}

/** Segment/source ids currently referenced by admin-created activities. */
async function loadAdminUsageSets(): Promise<{
  adminUsedSegmentIds: Set<string>;
  adminUsedSourceIds: Set<string>;
}> {
  const adminActivitiesInDb = await db
    .select({ id: activities.id, segmentIds: activities.segmentIds })
    .from(activities)
    .where(eq(activities.origin, "admin"));

  const adminUsedSegmentIds = new Set<string>();
  for (const a of adminActivitiesInDb) {
    if (Array.isArray(a.segmentIds)) {
      for (const sId of a.segmentIds) {
        if (sId) adminUsedSegmentIds.add(sId);
      }
    }
  }

  const adminUsedSourceIds = new Set<string>();
  if (adminUsedSegmentIds.size > 0) {
    const segRows = await db
      .select({ sourceId: sourceSegments.sourceId })
      .from(sourceSegments)
      .where(inArray(sourceSegments.id, Array.from(adminUsedSegmentIds)));
    for (const r of segRows) {
      if (r.sourceId) adminUsedSourceIds.add(r.sourceId);
    }
  }

  return { adminUsedSegmentIds, adminUsedSourceIds };
}

/**
 * Compute which manifest rows are blocked from overwriting DB rows.
 * Rule: origin='admin' OR referenced by an admin activity → conflict (reported);
 * a segment under a blocked source is silently blocked (conflict reported once
 * at the source level).
 */
export async function computeConflictClosure(
  data: ManifestData,
  approvedActivities: ManifestActivity[]
): Promise<ConflictClosure> {
  const origins = await getExistingOrigins();
  const { adminUsedSegmentIds, adminUsedSourceIds } = await loadAdminUsageSets();

  const blockedActivityIds = new Set<string>();
  const blockedSegmentIds = new Set<string>();
  const blockedSourceIds = new Set<string>();
  const conflicts: SyncConflict[] = [];

  // Sources
  for (const src of data.sources ?? []) {
    const isDirectAdmin = origins.sourceOrigins.get(src.id) === "admin";
    const isReferencedByAdminAct = adminUsedSourceIds.has(src.id);

    if (isDirectAdmin || isReferencedByAdminAct) {
      blockedSourceIds.add(src.id);
      conflicts.push({
        id: src.id,
        kind: "source",
        reason: isDirectAdmin
          ? `Source "${src.id}" được quản lý bởi admin (origin=admin). Drive sync không được ghi đè.`
          : `Source "${src.id}" đang được bài học của admin tham chiếu. Drive sync không được ghi đè.`,
      });
    }
  }

  // Segments
  for (const seg of data.segments ?? []) {
    const isDirectAdmin = origins.segmentOrigins.get(seg.id) === "admin";
    const isReferencedByAdminAct = adminUsedSegmentIds.has(seg.id);
    const isParentSourceBlocked = blockedSourceIds.has(seg.source_id);

    if (isDirectAdmin || isReferencedByAdminAct) {
      blockedSegmentIds.add(seg.id);
      conflicts.push({
        id: seg.id,
        kind: "segment",
        reason: isDirectAdmin
          ? `Segment "${seg.id}" được quản lý bởi admin (origin=admin). Drive sync không được ghi đè.`
          : `Segment "${seg.id}" đang được bài học của admin tham chiếu. Drive sync không được ghi đè.`,
      });
    } else if (isParentSourceBlocked) {
      blockedSegmentIds.add(seg.id);
    }
  }

  // Activities
  for (const act of approvedActivities) {
    if (origins.activityOrigins.get(act.id) === "admin") {
      blockedActivityIds.add(act.id);
      conflicts.push({
        id: act.id,
        kind: "activity",
        reason: `Activity "${act.id}" ("${act.title}") được quản lý bởi admin (origin=admin). Drive sync không được ghi đè.`,
      });
    }
  }

  return {
    origins,
    blocked: { blockedActivityIds, blockedSegmentIds, blockedSourceIds },
    conflicts,
  };
}
