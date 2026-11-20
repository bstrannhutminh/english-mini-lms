import { slugifyTopic } from "@/lib/topics";
import { createActivity, createSegment, createSource, updateActivity, updateSegment, updateSource } from "../admin-api";
import { draftToQuestion, type WizardData } from "./wizard-types";
import { intOrNull, upsert } from "./wizard-submit";
import type { SubmitPhase } from "./step-review";

export interface CreatedLessonIds { source: Set<string>; segment: Set<string>; activity: Set<string>; }

export async function createWizardLesson(data: WizardData, created: CreatedLessonIds, setPhase: (phase: SubmitPhase) => void) {
  const title = data.title.trim();
  const url = data.youtubeUrl.trim();
  const transcript = data.transcript.trim();
  const topic = data.topic.trim() ? slugifyTopic(data.topic) : null;
      setPhase("source");
      await upsert(createSource, updateSource, data.sourceId, {
        title,
        kind: "video",
        url,
        locatorType: "seconds",
        permission: "personal-study",
      }, created.source);

      setPhase("segment");
      await upsert(createSegment, updateSegment, data.segmentId, {
        sourceId: data.sourceId,
        startSeconds: intOrNull(data.startSeconds),
        endSeconds: intOrNull(data.endSeconds),
        transcriptContent: transcript,
        verifiedTranscript: data.verifiedTranscript,
        language: "en",
      }, created.segment);

      setPhase("activity");
      await upsert(createActivity, updateActivity, data.activityId, {
        mode: data.mode,
        title,
        durationMinutes: intOrNull(data.durationMinutes),
        difficulty: "beginner",
        purpose: "practice",
        answerReveal: "after_submit",
        segmentIds: [data.segmentId],
        questions: data.questions.map(draftToQuestion),
        topic,
      }, created.activity);

      setPhase("approve");
      await updateSource(data.sourceId, { reviewState: "approved" });
      await updateActivity(data.activityId, { reviewState: "approved" });


}
