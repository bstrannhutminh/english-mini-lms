import fs from "fs";
import path from "path";
import { isValidTopicKey, UNCATEGORIZED_TOPIC } from "../../lib/topics";
import type {
  ManifestActivity,
  ManifestSegment,
  ManifestSource,
} from "./manifest-types";

export interface ManifestReferenceCheck {
  errors: string[];
  /** Segment ids tham chiếu bởi activity đã duyệt — chỉ những id này được nạp. */
  neededSegmentIds: Set<string>;
  neededSourceIds: Set<string>;
}

/**
 * Phase 1 của parse manifest: kiểm tra mọi file/đối tượng được tham chiếu
 * bởi các activity `review_state=approved` tồn tại — "không nạp nửa chừng".
 */
export function validateManifestReferences(
  baseDir: string,
  approvedActivities: ManifestActivity[],
  allSources: ManifestSource[],
  allSegments: ManifestSegment[]
): ManifestReferenceCheck {
  const errors: string[] = [];
  const sourceMap = new Map(allSources.map((s) => [s.id, s]));
  const segmentMap = new Map(allSegments.map((s) => [s.id, s]));
  const neededSegmentIds = new Set<string>();
  const neededSourceIds = new Set<string>();

  for (const act of approvedActivities) {
    if (act.topic !== undefined && act.topic !== null) {
      const topicKey = String(act.topic).trim();
      if (topicKey !== "" && (!isValidTopicKey(topicKey) || topicKey === UNCATEGORIZED_TOPIC)) {
        errors.push(
          `Activity "${act.id}" ("${act.title}") có topic không hợp lệ: "${topicKey}" (chỉ dùng chữ thường/số nối bằng dấu gạch ngang, và không dùng "${UNCATEGORIZED_TOPIC}")`
        );
      }
    }

    for (const [field, label] of [
      [act.prompt_file, "đề bài"],
      [act.rubric_file, "rubric"],
      [act.questions_file, "câu hỏi"],
    ] as const) {
      if (field && !fs.existsSync(path.resolve(baseDir, field))) {
        errors.push(
          `Activity "${act.id}" ("${act.title}") thiếu file ${label}: ${field}`
        );
      }
    }

    if (act.segment_ids && Array.isArray(act.segment_ids)) {
      for (const segId of act.segment_ids) {
        const seg = segmentMap.get(segId);
        if (!seg) {
          errors.push(
            `Activity "${act.id}" ("${act.title}") tham chiếu segment không tồn tại: "${segId}"`
          );
          continue;
        }

        neededSegmentIds.add(segId);
        neededSourceIds.add(seg.source_id);

        if (seg.text_file && !fs.existsSync(path.resolve(baseDir, seg.text_file))) {
          errors.push(
            `Activity "${act.id}" ("${act.title}") tham chiếu segment "${segId}" thiếu file văn bản: ${seg.text_file}`
          );
        }

        if (seg.transcript_file && !fs.existsSync(path.resolve(baseDir, seg.transcript_file))) {
          errors.push(
            `Activity "${act.id}" ("${act.title}") tham chiếu segment "${segId}" thiếu file transcript: ${seg.transcript_file}`
          );
        }
      }
    }
  }

  for (const srcId of neededSourceIds) {
    if (!sourceMap.get(srcId)) {
      errors.push(`Nguồn học "${srcId}" được tham chiếu nhưng không có trong danh sách sources.`);
    }
  }

  return { errors, neededSegmentIds, neededSourceIds };
}
