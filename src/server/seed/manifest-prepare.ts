import fs from "fs";
import path from "path";
import yaml from "yaml";
import type {
  ManifestActivity,
  ManifestSegment,
  ManifestSource,
  ParsedManifestResult,
} from "./manifest-types";

/**
 * Phase 2 của parse manifest: đọc file vào bộ nhớ, map sang dạng upsert.
 * Chỉ chạy sau khi validateManifestReferences sạch lỗi.
 */
export function buildSourcesToUpsert(
  allSources: ManifestSource[],
  neededSourceIds: Set<string>
): ParsedManifestResult["sourcesToUpsert"] {
  return allSources
    .filter((s) => s.review_state === "approved" || neededSourceIds.has(s.id))
    .map((s) => ({
      id: s.id,
      title: s.title,
      kind: s.kind,
      permission: s.permission ?? null,
      locatorType: s.locator_type ?? null,
      url: s.url ?? null,
      reviewState: s.review_state,
      notes: s.notes ?? null,
    }));
}

export function buildSegmentsToUpsert(
  baseDir: string,
  neededSegmentIds: Set<string>,
  allSegments: ManifestSegment[]
): ParsedManifestResult["segmentsToUpsert"] {
  const segmentMap = new Map(allSegments.map((s) => [s.id, s]));
  return Array.from(neededSegmentIds).map((segId) => {
    const seg = segmentMap.get(segId)!;
    const readFile = (rel?: string) =>
      rel ? fs.readFileSync(path.resolve(baseDir, rel), "utf-8") : null;

    return {
      id: seg.id,
      sourceId: seg.source_id,
      page: seg.page ?? null,
      startSeconds: seg.start_seconds ?? null,
      endSeconds: seg.end_seconds ?? null,
      textContent: readFile(seg.text_file),
      transcriptContent: readFile(seg.transcript_file),
      verifiedTranscript: seg.verified_transcript ?? false,
      language: seg.language ?? "en",
    };
  });
}

export function buildActivitiesToUpsert(
  baseDir: string,
  approvedActivities: ManifestActivity[]
): ParsedManifestResult["activitiesToUpsert"] {
  return approvedActivities.map((act) => {
    let promptText: string | null = null;
    let rubricJson: unknown = null;

    if (act.prompt_file) {
      promptText = fs.readFileSync(path.resolve(baseDir, act.prompt_file), "utf-8");
    }
    if (act.rubric_file) {
      rubricJson = yaml.parse(
        fs.readFileSync(path.resolve(baseDir, act.rubric_file), "utf-8")
      );
    }

    return {
      id: act.id,
      slot: act.slot ?? null,
      mode: act.mode,
      title: act.title,
      objective: act.objective ?? null,
      durationMinutes: act.duration_minutes ?? null,
      difficulty: act.difficulty ?? "trial",
      promptText,
      feedbackGuide: act.feedback_guide ?? null,
      rubricJson,
      answerReveal: act.answer_reveal ?? "none",
      purpose: act.purpose ?? null,
      reviewState: act.review_state,
      segmentIds: act.segment_ids ?? [],
      questionsFile: act.questions_file ?? null,
      output: act.output ?? null,
      topic: act.topic ? String(act.topic).trim() || null : null,
    };
  });
}
