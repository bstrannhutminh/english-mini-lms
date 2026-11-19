/**
 * Phase 2 — write staged rows to the DB (skipped entirely on dry-run).
 * Upsert by id; never touches rows blocked by the conflict closure (they were
 * filtered out during staging). Per-row errors are collected, not thrown.
 */
import { db } from "../../../db";
import { activities, sourceSegments, sources } from "../../../db/schema";
import type { StagedActivity } from "./stage-activities";
import type { OriginMaps } from "./conflicts";
import type { SyncResult } from "./types";

type StagedSource = typeof sources.$inferInsert;
type StagedSegment = typeof sourceSegments.$inferInsert;

export interface StagedRows {
  sources: StagedSource[];
  segments: StagedSegment[];
  activities: StagedActivity[];
}

export async function applyStagedRows(
  stagedRows: StagedRows,
  origins: OriginMaps,
  dryRun: boolean,
  result: SyncResult
): Promise<void> {
  for (const src of stagedRows.sources) {
    if (!dryRun) {
      try {
        await db
          .insert(sources)
          .values(src)
          .onConflictDoUpdate({
            target: sources.id,
            set: {
              title: src.title,
              kind: src.kind,
              permission: src.permission,
              locatorType: src.locatorType,
              url: src.url,
              reviewState: src.reviewState,
              notes: src.notes,
              origin: "drive",
            },
          });
      } catch (err) {
        result.errors.push({
          id: src.id,
          message: `Lỗi upsert source: ${err instanceof Error ? err.message : String(err)}`,
        });
        continue;
      }
    }

    if (origins.sourceOrigins.has(src.id)) {
      result.updated.push(`source:${src.id}`);
    } else {
      result.added.push(`source:${src.id}`);
    }
  }

  for (const seg of stagedRows.segments) {
    if (!dryRun) {
      try {
        await db
          .insert(sourceSegments)
          .values(seg)
          .onConflictDoUpdate({
            target: sourceSegments.id,
            set: {
              sourceId: seg.sourceId,
              page: seg.page,
              startSeconds: seg.startSeconds,
              endSeconds: seg.endSeconds,
              textContent: seg.textContent,
              transcriptContent: seg.transcriptContent,
              verifiedTranscript: seg.verifiedTranscript,
              language: seg.language,
              origin: "drive",
            },
          });
      } catch (err) {
        result.errors.push({
          id: seg.id,
          message: `Lỗi upsert segment: ${err instanceof Error ? err.message : String(err)}`,
        });
        continue;
      }
    }

    if (origins.segmentOrigins.has(seg.id)) {
      result.updated.push(`segment:${seg.id}`);
    } else {
      result.added.push(`segment:${seg.id}`);
    }
  }

  for (const act of stagedRows.activities) {
    if (!dryRun) {
      try {
        await db
          .insert(activities)
          .values(act)
          .onConflictDoUpdate({
            target: activities.id,
            set: {
              slot: act.slot,
              mode: act.mode,
              title: act.title,
              objective: act.objective,
              durationMinutes: act.durationMinutes,
              difficulty: act.difficulty,
              promptText: act.promptText,
              feedbackGuide: act.feedbackGuide,
              rubricJson: act.rubricJson,
              answerReveal: act.answerReveal,
              purpose: act.purpose,
              reviewState: act.reviewState,
              segmentIds: act.segmentIds,
              questionsFile: act.questionsFile,
              questions: act.questions,
              output: act.output,
              topic: act.topic,
              origin: "drive",
            },
          });
      } catch (err) {
        result.errors.push({
          id: act.id,
          message: `Lỗi upsert activity: ${err instanceof Error ? err.message : String(err)}`,
        });
        continue;
      }
    }

    if (origins.activityOrigins.has(act.id)) {
      result.updated.push(`activity:${act.id}`);
    } else {
      result.added.push(`activity:${act.id}`);
    }
  }
}
