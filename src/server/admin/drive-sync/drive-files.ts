/**
 * Drive file access layer for the sync pipeline:
 *  - indexDriveFolder: find manifest.yaml + texts/ transcripts/ rubrics/ subfolders
 *  - buildDriveFileReader: cached reader resolving "subfolder/file" paths
 *    used by manifest (texts/x.md, transcripts/y.txt, rubrics/z.yaml)
 */
import {
  downloadFileText,
  findFileByName,
  findSubFolderId,
  getDriveClient,
  listFolderContents,
  type DriveFile,
} from "../../providers/google-drive";

export interface FolderIndex {
  manifestFile: DriveFile | null;
  textsFolderId: string | null;
  transcriptsFolderId: string | null;
  rubricsFolderId: string | null;
}

type Drive = ReturnType<typeof getDriveClient>;

export async function indexDriveFolder(
  drive: Drive,
  rootFolderId: string
): Promise<{ index: FolderIndex; structureErrors: string[] }> {
  const structureErrors: string[] = [];

  const rootItems = await listFolderContents(drive, rootFolderId);

  const manifestFile =
    rootItems.find(
      (f) =>
        f.name === "manifest.yaml" &&
        f.mimeType !== "application/vnd.google-apps.folder"
    ) ?? null;

  if (!manifestFile) {
    structureErrors.push(
      "Không tìm thấy manifest.yaml ở gốc thư mục Drive. Kiểm tra lại cấu trúc thư mục."
    );
  }

  const textsFolderId = await findSubFolderId(drive, rootFolderId, "texts");
  const transcriptsFolderId = await findSubFolderId(
    drive,
    rootFolderId,
    "transcripts"
  );
  const rubricsFolderId = await findSubFolderId(drive, rootFolderId, "rubrics");

  if (!textsFolderId) {
    structureErrors.push(
      "Không tìm thấy thư mục con texts/ trong thư mục Drive."
    );
  }
  if (!transcriptsFolderId) {
    structureErrors.push(
      "Không tìm thấy thư mục con transcripts/ trong thư mục Drive."
    );
  }

  return {
    index: {
      manifestFile,
      textsFolderId,
      transcriptsFolderId,
      rubricsFolderId,
    },
    structureErrors,
  };
}

export type DriveFileReader = (relativePath: string) => Promise<string | null>;

/**
 * Returns a cached "subfolder/file" reader. Missing/unsupported paths resolve
 * to null (and push a warning) so callers can mark their parent entity failed.
 * May throw DriveNetworkOrQuotaError — callers must treat it as fatal.
 */
export function buildDriveFileReader(
  drive: Drive,
  folderIndex: FolderIndex,
  warnings: string[]
): DriveFileReader {
  const cache = new Map<string, string | null>();

  return async (relativePath: string): Promise<string | null> => {
    if (cache.has(relativePath)) return cache.get(relativePath)!;

    const parts = relativePath.replace(/\\/g, "/").split("/");
    if (parts.length !== 2) {
      warnings.push(
        `Đường dẫn "${relativePath}" không đúng cấu trúc (phải là "subfolder/filename"). Bỏ qua.`
      );
      cache.set(relativePath, null);
      return null;
    }

    const [subfolderName, fileName] = parts;
    let parentFolderId: string | null = null;

    switch (subfolderName) {
      case "texts":
        parentFolderId = folderIndex.textsFolderId;
        break;
      case "transcripts":
        parentFolderId = folderIndex.transcriptsFolderId;
        break;
      case "rubrics":
        parentFolderId = folderIndex.rubricsFolderId;
        break;
      default:
        warnings.push(
          `Thư mục "${subfolderName}" không được hỗ trợ (chỉ texts/ transcripts/ rubrics/). Bỏ qua.`
        );
        cache.set(relativePath, null);
        return null;
    }

    if (!parentFolderId) {
      cache.set(relativePath, null);
      return null;
    }

    const file = await findFileByName(drive, parentFolderId, fileName);
    if (!file) {
      cache.set(relativePath, null);
      return null;
    }

    const content = await downloadFileText(drive, file.id);
    cache.set(relativePath, content);
    return content;
  };
}
