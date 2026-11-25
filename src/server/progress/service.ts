import { db } from "@/db";
import {
  activities,
  errorObservations,
  learningSessions,
  submissions,
  vocabularyVault,
} from "@/db/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { summarizeSubmissionSkills } from "./skill-stats";
import { buildRevisionComparisons, type RevisionComparisonItem } from "./revision-comparisons";

export type { RevisionComparisonItem } from "./revision-comparisons";

export interface SkillCount {
  skill: "writing" | "reading" | "speaking" | "listening";
  total: number;
  independent: number;
  assisted: number;
}

export interface RecurringErrorCategory {
  category: string;
  count: number;
  samples: string[];
}

/**
 * Wire shape: contracts/progress.ts (revisionComparisonSchema).
 * Dates are ISO-8601 strings — identical over the API and across the
 * server→client boundary (avoids Date-vs-string drift).
 */
// Wire shape RevisionComparisonItem lives in revision-comparisons.ts and is re-exported above.

export interface ProgressSummary {
  sessionsThisWeek: number;
  actualStudyMinutes: number;
  totalSubmissions: number;
  hasSufficientData: boolean;
  insufficientDataMessage?: string;
  skillBreakdown: SkillCount[];
  independentCount: number;
  assistedCount: number;
  recurringErrors: RecurringErrorCategory[];
  masteredVocabCount: number;
  totalVocabCount: number;
  revisionComparisons: RevisionComparisonItem[];
}

export async function getProgressSummary(learnerId: string): Promise<ProgressSummary> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 4 nhóm truy vấn độc lập — chạy song song thay vì nối tiếp 4 lượt chờ DB.
  const [allSessions, allSubmissions, errors, vocabItems] = await Promise.all([
    // 1. Số phiên học trong tuần & phút thực học (tính từ activeSeconds)
    db
      .select({
        id: learningSessions.id,
        activeSeconds: learningSessions.activeSeconds,
        startedAt: learningSessions.createdAt,
      })
      .from(learningSessions)
      .where(eq(learningSessions.learnerId, learnerId)),

    // 2. Toàn bộ submissions để thống kê kỹ năng & tách độc lập / có hỗ trợ.
    //    body chỉ dùng cho excerpt 150 ký tự trong revision-comparisons nên
    //    cắt ngay tại DB (left) thay vì kéo cả bài dài về rồi .slice.
    db
      .select({
        id: submissions.id,
        sessionId: submissions.sessionId,
        revision: submissions.revision,
        parentId: submissions.parentId,
        body: sql<string | null>`left(${submissions.body}, 150)`.as("body"),
        assisted: submissions.assisted,
        submittedAt: submissions.submittedAt,
        activityId: learningSessions.activityId,
        activityTitle: activities.title,
        activityMode: activities.mode,
      })
      .from(submissions)
      .innerJoin(learningSessions, eq(submissions.sessionId, learningSessions.id))
      .innerJoin(activities, eq(learningSessions.activityId, activities.id))
      .where(
        and(
          eq(submissions.learnerId, learnerId),
          isNull(submissions.deletedAt)
        )
      )
      .orderBy(desc(submissions.submittedAt)),

    // 3. Lỗi lặp: error_observations nhóm theo category
    db
      .select({
        id: errorObservations.id,
        category: errorObservations.category,
        evidence: errorObservations.evidence,
        createdAt: errorObservations.createdAt,
      })
      .from(errorObservations)
      .where(eq(errorObservations.learnerId, learnerId))
      .orderBy(desc(errorObservations.createdAt)),

    // 4. Từ vựng trong Vault: tổng từ & từ đã thuộc (mastery_level >= 4)
    db
      .select({
        id: vocabularyVault.id,
        masteryLevel: vocabularyVault.masteryLevel,
      })
      .from(vocabularyVault)
      .where(eq(vocabularyVault.learnerId, learnerId)),
  ]);

  const sessionsThisWeek = allSessions.filter(
    (s) => s.startedAt && new Date(s.startedAt) >= oneWeekAgo
  ).length;

  const totalActiveSeconds = allSessions.reduce(
    (acc, s) => acc + (s.activeSeconds || 0),
    0
  );
  const actualStudyMinutes = Math.round(totalActiveSeconds / 60);

  const totalSubmissions = allSubmissions.length;
  const hasSufficientData = totalSubmissions >= 3;
  const insufficientDataMessage = hasSufficientData
    ? undefined
    : "Chưa đủ bằng chứng để phân tích xu hướng học tập (cần tối thiểu 3 bài nộp).";

  // modeSkill() là nguồn duy nhất: ielts-writing/reading/speaking/listening
  // không bị rơi khỏi thống kê như cast literal trước đây.
  const { skillBreakdown, independentCount, assistedCount } =
    summarizeSubmissionSkills(allSubmissions);

  const errorCategoryMap: Record<string, { count: number; samples: string[] }> = {};
  for (const err of errors) {
    const cat = err.category || "khác";
    if (!errorCategoryMap[cat]) {
      errorCategoryMap[cat] = { count: 0, samples: [] };
    }
    errorCategoryMap[cat].count += 1;
    if (err.evidence && errorCategoryMap[cat].samples.length < 3) {
      errorCategoryMap[cat].samples.push(err.evidence);
    }
  }

  const recurringErrors: RecurringErrorCategory[] = Object.entries(errorCategoryMap)
    .map(([category, data]) => ({
      category,
      count: data.count,
      samples: data.samples,
    }))
    .sort((a, b) => b.count - a.count);

  const totalVocabCount = vocabItems.length;
  const masteredVocabCount = vocabItems.filter((v) => v.masteryLevel >= 4).length;

  // 5. Danh sách bài có bản sửa để so sánh (revision >= 2 hoặc parentId != null)
  const revisionComparisons = buildRevisionComparisons(allSubmissions);

  return {
    sessionsThisWeek,
    actualStudyMinutes,
    totalSubmissions,
    hasSufficientData,
    insufficientDataMessage,
    skillBreakdown,
    independentCount,
    assistedCount,
    recurringErrors,
    masteredVocabCount,
    totalVocabCount,
    revisionComparisons,
  };
}
