import yaml from "yaml";
import type { ManifestData, ParsedManifestResult } from "./manifest-types";
import { validateManifestReferences } from "./manifest-validate";
import {
  buildActivitiesToUpsert,
  buildSegmentsToUpsert,
  buildSourcesToUpsert,
} from "./manifest-prepare";

export type {
  SyncFileReader,
  ManifestSource,
  ManifestSegment,
  ManifestActivity,
  ManifestData,
  ParsedManifestResult,
} from "./manifest-types";

/**
 * Parses manifest YAML string into ManifestData WITHOUT validating referenced files.
 * Use this when the file contents are loaded externally (e.g., from Google Drive).
 * Returns { success, data, errors }.
 */
export function parseManifestYaml(
  manifestYamlContent: string
): { success: true; data: ManifestData } | { success: false; errors: string[] } {
  try {
    const data = yaml.parse(manifestYamlContent) as ManifestData;
    if (!data || typeof data !== "object") {
      return { success: false, errors: ["Manifest rỗng hoặc định dạng không đúng."] };
    }
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      errors: [`Không thể parse YAML của manifest: ${err instanceof Error ? err.message : String(err)}`],
    };
  }
}

/**
 * Parses and validates manifest.yaml and its referenced content files.
 * Enforces invariant: Only approved items are loaded.
 * If any referenced file is missing, reports clear error with activity ID and does NOT proceed.
 */
export function parseAndValidateManifest(
  baseDir: string,
  manifestYamlContent: string
): ParsedManifestResult {
  const empty: Pick<
    ParsedManifestResult,
    "sourcesToUpsert" | "segmentsToUpsert" | "activitiesToUpsert"
  > = {
    sourcesToUpsert: [],
    segmentsToUpsert: [],
    activitiesToUpsert: [],
  };

  let data: ManifestData;
  try {
    data = yaml.parse(manifestYamlContent) as ManifestData;
  } catch (err) {
    return {
      success: false,
      errors: [`Không thể parse YAML của manifest: ${err instanceof Error ? err.message : String(err)}`],
      ...empty,
    };
  }

  if (!data || typeof data !== "object") {
    return {
      success: false,
      errors: ["Manifest rỗng hoặc định dạng không đúng."],
      ...empty,
    };
  }

  const allSources = data.sources || [];
  const allSegments = data.segments || [];
  const allActivities = data.activities || [];

  // Rule: Only import review_state = approved activities
  const approvedActivities = allActivities.filter(
    (act) => act.review_state === "approved"
  );

  // 1. Validation phase: check all referenced files for approved activities
  const { errors, neededSegmentIds, neededSourceIds } =
    validateManifestReferences(baseDir, approvedActivities, allSources, allSegments);

  // If there are ANY errors, stop immediately — "không nạp nửa chừng"
  if (errors.length > 0) {
    return { success: false, errors, ...empty };
  }

  // 2. Data preparation phase: read files into memory
  return {
    success: true,
    errors: [],
    sourcesToUpsert: buildSourcesToUpsert(allSources, neededSourceIds),
    segmentsToUpsert: buildSegmentsToUpsert(baseDir, neededSegmentIds, allSegments),
    activitiesToUpsert: buildActivitiesToUpsert(baseDir, approvedActivities),
  };
}
