/**
 * Shared types for the Drive → DB sync pipeline.
 * The public result shape is consumed by /api/v1/admin/content/sync-drive
 * and the Drive Sync admin tab — keep field names stable.
 */

export interface SyncConflict {
  id: string;
  kind: "activity" | "source" | "segment";
  reason: string;
}

export interface SyncError {
  file?: string;
  id?: string;
  message: string;
}

export interface SyncResult {
  added: string[];
  updated: string[];
  skipped: string[];
  conflicts: SyncConflict[];
  errors: SyncError[];
  dryRun: boolean;
}

export function emptySyncResult(dryRun: boolean): SyncResult {
  return { added: [], updated: [], skipped: [], conflicts: [], errors: [], dryRun };
}

/** Warnings are reported as errors prefixed "[warning]" — non-fatal. */
export function isSyncWarning(e: SyncError): boolean {
  return e.message.startsWith("[warning]");
}

/**
 * Outcome of a staging step. `fatal` is set when a Drive network/quota error
 * must stop the whole sync immediately (never write half a sync).
 */
export interface StagingOutcome<T> {
  staged: T[];
  errors: SyncError[];
  fatalError?: SyncError;
}
