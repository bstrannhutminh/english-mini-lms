export interface RevisionComparisonItem {
  activityId: string;
  activityTitle: string;
  mode: string;
  originalSubmissionId: string;
  revisedSubmissionId: string;
  originalDate: string;
  revisedDate: string;
  originalAssisted: boolean;
  revisedAssisted: boolean;
  originalExcerpt: string;
  revisedExcerpt: string;
}

export interface RevisionSubmissionRow {
  id: string;
  revision: number;
  parentId: string | null;
  body: string | null;
  assisted: boolean;
  submittedAt: Date;
  activityId: string;
  activityTitle: string;
  activityMode: string;
}

/** Ghép bản sửa với bản gốc để màn Tiến độ so sánh; mỗi revised submission chỉ xuất hiện một lần. */
export function buildRevisionComparisons(rows: RevisionSubmissionRow[]): RevisionComparisonItem[] {
  const revisions = rows.filter((row) => row.parentId !== null || row.revision > 1);
  const comparisons: RevisionComparisonItem[] = [];

  for (const revised of revisions) {
    const original = rows.find(
      (row) => row.id === revised.parentId || (row.activityId === revised.activityId && row.revision === 1)
    );
    if (!original || original.id === revised.id) continue;
    if (comparisons.some((item) => item.revisedSubmissionId === revised.id)) continue;

    comparisons.push({
      activityId: revised.activityId,
      activityTitle: revised.activityTitle,
      mode: revised.activityMode,
      originalSubmissionId: original.id,
      revisedSubmissionId: revised.id,
      originalDate: original.submittedAt.toISOString(),
      revisedDate: revised.submittedAt.toISOString(),
      originalAssisted: original.assisted,
      revisedAssisted: revised.assisted,
      originalExcerpt: (original.body || "").slice(0, 150),
      revisedExcerpt: (revised.body || "").slice(0, 150),
    });
  }

  return comparisons;
}
