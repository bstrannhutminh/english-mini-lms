import yaml from "yaml";
import { validateListeningQuestions } from "../../../lib/listening-questions";
import { modeSkill } from "../../../lib/modes";
import { DriveNetworkOrQuotaError } from "../../providers/google-drive";
import type { ManifestActivity } from "../../seed/manifest-parser";
import type { DriveFileReader } from "./drive-files";
import type { SyncError } from "./types";

export type FileRead = { ok: true; content: string } | { ok: false; fatal?: SyncError };

function fatal(err: unknown, id: string, file: string): SyncError | null {
  return err instanceof DriveNetworkOrQuotaError
    ? {
        id,
        file,
        message: `Lỗi mạng hoặc hạn ngạch Drive: ${err.message}. Đã ngừng đồng bộ để tránh ghi nửa chừng.`,
      }
    : null;
}

/** Đọc file Drive; `ok=false` (không fatal) = activity bỏ qua, `fatal` = dừng sync. */
export async function readActivityFile(
  readFile: DriveFileReader,
  actId: string,
  path: string,
  missingMessage: string,
  loadErrorLabel: string,
  errors: SyncError[]
): Promise<FileRead> {
  try {
    const content = await readFile(path);
    if (content === null) {
      errors.push({ id: actId, file: path, message: missingMessage });
      return { ok: false };
    }
    return { ok: true, content };
  } catch (err) {
    const fatalError = fatal(err, actId, path);
    if (fatalError) return { ok: false, fatal: fatalError };
    errors.push({
      id: actId,
      file: path,
      message: `${loadErrorLabel} ${path}: ${err instanceof Error ? err.message : String(err)}`,
    });
    return { ok: false };
  }
}

/** questions_file của bài nghe (gồm ielts-listening): bắt buộc + đúng schema màn nghe đọc. */
export async function stageQuestions(
  act: ManifestActivity,
  readFile: DriveFileReader,
  errors: SyncError[]
): Promise<{ value: unknown; fatal?: SyncError } | null> {
  if (modeSkill(act.mode) !== "listening") return { value: null };
  if (!act.questions_file) {
    errors.push({
      id: act.id,
      message: `Activity nghe "${act.id}" bắt buộc phải khai báo questions_file trong manifest.`,
    });
    return null;
  }

  const r = await readActivityFile(
    readFile,
    act.id,
    act.questions_file,
    `Activity "${act.id}" thiếu file câu hỏi nghe: ${act.questions_file}`,
    "Lỗi tải/parse",
    errors
  );
  if (!r.ok) {
    if (r.fatal) return { value: null, fatal: r.fatal };
    return null;
  }

  try {
    const parsed = yaml.parse(r.content);
    const rawList = Array.isArray(parsed) ? parsed : parsed?.questions;
    const val = validateListeningQuestions(rawList);
    if (!val.ok) {
      errors.push({
        id: act.id,
        file: act.questions_file,
        message: `File câu hỏi nghe "${act.questions_file}" không hợp lệ: ${val.errors.join("; ")}`,
      });
      return null;
    }
    return { value: val.value };
  } catch (err) {
    errors.push({
      id: act.id,
      file: act.questions_file,
      message: `Lỗi tải/parse ${act.questions_file}: ${err instanceof Error ? err.message : String(err)}`,
    });
    return null;
  }
}
