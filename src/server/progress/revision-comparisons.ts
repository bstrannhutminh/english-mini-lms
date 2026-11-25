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

/**
 * Ghép bản sửa với bản gốc để màn Tiến độ so sánh; mỗi revised submission chỉ xuất hiện một lần.
 * Tra cứu qua Map (O(n)) thay vì .find() trong vòng lặp (O(n²)) — danh sách
 * submission dài theo thời gian học nên tránh quét lại toàn bộ mỗi bản sửa.
 */
export function buildRevisionComparisons(rows: RevisionSubmissionRow[]): RevisionComparisonItem[] {
  const byId = new Map(rows.map((row) => [row.id, row]));
  // Bản revision=1 theo activity — fallback khi parentId không trỏ đúng bản gốc.
  const originalByActivity = new Map(
    rows.filter((row) => row.revision === 1).map((row) => [row.activityId, row])
  );

  const comparisons: RevisionComparisonItem[] = [];
  const seenRevised = new Set<string>();

  for (const revised of rows) {
    if (revised.parentId === null && revised.revision <= 1) continue;
    if (seenRevised.has(revised.id)) continue;

    const original =
      (revised.parentId ? byId.get(revised.parentId) : undefined) ??
      originalByActivity.get(revised.activityId);
    if (!original || original.id === revised.id) continue;
    seenRevised.add(revised.id);

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
