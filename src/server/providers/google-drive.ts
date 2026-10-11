/**
 * Google Drive API v3 client helper.
 * Uses a Service Account for authentication (no user OAuth needed).
 *
 * Required env vars:
 *   GOOGLE_SERVICE_ACCOUNT_JSON  – minified JSON key string
 *   GOOGLE_DRIVE_FOLDER_ID       – root folder ID containing manifest.yaml
 */
import { google } from "googleapis";

// ──────────────────────────────────────────────
// Types & Errors
// ──────────────────────────────────────────────

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string | null;
}

export class DriveNetworkOrQuotaError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "DriveNetworkOrQuotaError";
  }
}

// ──────────────────────────────────────────────
// Client factory
// ──────────────────────────────────────────────

function getServiceAccountAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is not set. See docs/google-drive-setup.md."
    );
  }

  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON. Make sure you minified the key file correctly."
    );
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

export function getDriveClient() {
  const auth = getServiceAccountAuth();
  return google.drive({ version: "v3", auth });
}

export function getDriveFolderId(): string {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error(
      "GOOGLE_DRIVE_FOLDER_ID is not set. See docs/google-drive-setup.md."
    );
  }
  return folderId;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Lists all files directly inside a Drive folder (non-recursive).
 * Handles pagination with nextPageToken.
 */
export async function listFolderContents(
  drive: ReturnType<typeof getDriveClient>,
  folderId: string
): Promise<DriveFile[]> {
  const allFiles: DriveFile[] = [];
  let pageToken: string | undefined = undefined;

  do {
    const res: { data: { files?: unknown[]; nextPageToken?: string | null } } =
      await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "nextPageToken, files(id, name, mimeType, modifiedTime)",
        pageSize: 1000,
        pageToken,
      });
    if (res.data.files) {
      allFiles.push(...(res.data.files as DriveFile[]));
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  return allFiles;
}

/**
 * Downloads a file's text content from Drive.
 * Returns null if the file cannot be found (404 / file not found).
 * Throws DriveNetworkOrQuotaError if a network, quota, or server error occurs.
 */
export async function downloadFileText(
  drive: ReturnType<typeof getDriveClient>,
  fileId: string
): Promise<string | null> {
  try {
    const res = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "text" }
    );
    return typeof res.data === "string" ? res.data : JSON.stringify(res.data);
  } catch (err: unknown) {
    const status =
      (err as { status?: number; code?: number })?.status ||
      (err as { status?: number; code?: number })?.code;
    const message = (err as Error)?.message || "";

    // 404: Không tìm thấy file -> trả về null để caller ghi nhận lỗi thiếu file
    if (status === 404 || message.includes("File not found") || message.includes("404")) {
      return null;
    }

    // Các lỗi mạng, quota (403, 429), server (5xx), connection timeout -> ném lỗi để dừng sync
    throw new DriveNetworkOrQuotaError(
      `Drive API error (${status || "network"}): ${message}`,
      err
    );
  }
}

/**
 * Finds a file by name inside a folder.
 * Escapes single quotes in fileName for safe Drive queries.
 */
export async function findFileByName(
  drive: ReturnType<typeof getDriveClient>,
  folderId: string,
  fileName: string
): Promise<DriveFile | null> {
  const escapedName = fileName.replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name = '${escapedName}' and trashed = false`,
    fields: "files(id, name, mimeType, modifiedTime)",
    pageSize: 1,
  });
  const files = res.data.files ?? [];
  return files.length > 0 ? (files[0] as DriveFile) : null;
}

/**
 * Finds a sub-folder by name inside a parent folder.
 * Returns the folder's ID or null.
 */
export async function findSubFolderId(
  drive: ReturnType<typeof getDriveClient>,
  parentFolderId: string,
  folderName: string
): Promise<string | null> {
  const escapedName = folderName.replace(/'/g, "\\'");
  const res = await drive.files.list({
    q: `'${parentFolderId}' in parents and name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    pageSize: 1,
  });
  const folders = res.data.files ?? [];
  return folders.length > 0 ? (folders[0].id ?? null) : null;
}
