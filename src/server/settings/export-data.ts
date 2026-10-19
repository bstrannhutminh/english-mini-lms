import { eq, inArray } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import {
  assessments,
  feedbackVersions,
  learners,
  learningSessions,
  mediaObjects,
  submissions,
  vocabularyVault,
} from "@/db/schema";
import { getPartialEnv } from "@/lib/env";

/** Storage client cho signed URL — service role nếu có, fallback anon. */
function getStorageClient() {
  const env = getPartialEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Xuất toàn bộ dữ liệu học tập của learner (JSON backup): hồ sơ, sổ từ,
 * phiên học, bài nộp (bỏ bản đã xoá mềm), assessment + feedback, và media
 * kèm signed URL tải file (hạn 24 giờ). Chỉ dữ liệu của learnerId từ session.
 */
export async function exportLearnerData(learnerId: string) {
  // 1. Thông tin học viên
  const [learnerProfile] = await db
    .select()
    .from(learners)
    .where(eq(learners.id, learnerId))
    .limit(1);

  // 2. Sổ từ vựng
  const vocabList = await db
    .select()
    .from(vocabularyVault)
    .where(eq(vocabularyVault.learnerId, learnerId));

  // 3. Các phiên học
  const sessionsList = await db
    .select()
    .from(learningSessions)
    .where(eq(learningSessions.learnerId, learnerId));

  // 4. Các bài nộp (chỉ bài chưa bị xóa)
  const submissionsList = await db
    .select()
    .from(submissions)
    .where(eq(submissions.learnerId, learnerId));
  const activeSubmissions = submissionsList.filter((s) => !s.deletedAt);

  // 5. Đánh giá và nhận xét AI
  const submissionIds = activeSubmissions.map((s) => s.id);
  let assessmentsList: Array<typeof assessments.$inferSelect> = [];
  let feedbackList: Array<typeof feedbackVersions.$inferSelect> = [];

  if (submissionIds.length > 0) {
    assessmentsList = await db
      .select()
      .from(assessments)
      .where(inArray(assessments.submissionId, submissionIds));

    const assessmentIds = assessmentsList.map((a) => a.id);
    if (assessmentIds.length > 0) {
      feedbackList = await db
        .select()
        .from(feedbackVersions)
        .where(inArray(feedbackVersions.assessmentId, assessmentIds));
    }
  }

  // 6. Danh sách media objects và tạo Signed URLs tải file (hạn 24 giờ)
  const mediaList = await db
    .select()
    .from(mediaObjects)
    .where(eq(mediaObjects.learnerId, learnerId));

  const supabase = getStorageClient();
  const mediaWithDownloadUrls = await Promise.all(
    mediaList.map(async (m) => {
      let downloadUrl: string | null = null;
      if (supabase && m.storageKey) {
        try {
          const { data } = await supabase.storage
            .from("learner-media")
            .createSignedUrl(m.storageKey, 86400); // 24h
          if (data?.signedUrl) {
            downloadUrl = data.signedUrl;
          }
        } catch (e) {
          console.warn("Could not create signed url for media:", m.id, e);
        }
      }
      return {
        id: m.id,
        storageKey: m.storageKey,
        mimeType: m.mimeType,
        sizeBytes: m.sizeBytes,
        durationSeconds: m.durationSeconds,
        status: m.status,
        createdAt: m.createdAt,
        downloadUrl,
      };
    })
  );

  return {
    exportedAt: new Date().toISOString(),
    app: "English Mini LMS",
    version: "1.0",
    learner: learnerProfile,
    vocabularyVault: vocabList,
    learningSessions: sessionsList,
    submissions: activeSubmissions,
    assessments: assessmentsList,
    feedbackVersions: feedbackList,
    mediaObjects: mediaWithDownloadUrls,
  };
}
