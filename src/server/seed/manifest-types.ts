// FileReader abstraction — allows Drive sync to provide its own reader
export type SyncFileReader = (relativePath: string) => Promise<string | null>;

export interface ManifestSource {
  id: string;
  title: string;
  kind: string;
  permission?: string;
  locator_type?: string;
  url?: string;
  review_state: "draft" | "reviewing" | "approved" | "rejected" | "retired";
  notes?: string;
}

export interface ManifestSegment {
  id: string;
  source_id: string;
  page?: number;
  start_seconds?: number;
  end_seconds?: number;
  text_file?: string;
  transcript_file?: string;
  verified_transcript?: boolean;
  language?: string;
}

export interface ManifestActivity {
  id: string;
  slot?: string;
  mode:
    | "writing"
    | "reading"
    | "speaking"
    | "listening"
    | "ielts-writing"
    | "ielts-reading"
    | "ielts-speaking"
    | "ielts-listening";
  title: string;
  objective?: string;
  duration_minutes?: number;
  difficulty?: "trial" | "beginner" | "intermediate" | "advanced";
  prompt_file?: string;
  feedback_guide?: string;
  rubric_file?: string;
  answer_reveal?: "none" | "after_submit" | "on_request";
  purpose?: string;
  review_state: "draft" | "reviewing" | "approved" | "rejected" | "retired";
  segment_ids?: string[];
  questions_file?: string;
  output?: string;
  topic?: string;
}

export interface ManifestData {
  version: number;
  timezone?: string;
  sources?: ManifestSource[];
  segments?: ManifestSegment[];
  activities?: ManifestActivity[];
}

export interface ParsedManifestResult {
  success: boolean;
  errors: string[];
  sourcesToUpsert: Array<{
    id: string;
    title: string;
    kind: string;
    permission: string | null;
    locatorType: string | null;
    url: string | null;
    reviewState: "draft" | "reviewing" | "approved" | "rejected" | "retired";
    notes: string | null;
  }>;
  segmentsToUpsert: Array<{
    id: string;
    sourceId: string;
    page: number | null;
    startSeconds: number | null;
    endSeconds: number | null;
    textContent: string | null;
    transcriptContent: string | null;
    verifiedTranscript: boolean;
    language: string;
  }>;
  activitiesToUpsert: Array<{
    id: string;
    slot: string | null;
    mode: ManifestActivity["mode"];
    title: string;
    objective: string | null;
    durationMinutes: number | null;
    difficulty: "trial" | "beginner" | "intermediate" | "advanced";
    promptText: string | null;
    feedbackGuide: string | null;
    rubricJson: unknown;
    answerReveal: "none" | "after_submit" | "on_request";
    purpose: string | null;
    reviewState: "draft" | "reviewing" | "approved" | "rejected" | "retired";
    segmentIds: string[];
    questionsFile: string | null;
    output: string | null;
    topic: string | null;
  }>;
}
