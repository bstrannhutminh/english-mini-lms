/**
 * Tests for drive-sync.ts
 * Dùng vi.mock để mock Drive client — không gọi thật Google Drive API.
 * Dùng DB thật (Supabase) cho các test conflict + dry-run.
 */
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activities, sources, sourceSegments } from "@/db/schema";

// ── Mock googleapis trước khi import drive-sync ──────────────────────────────
// Dùng vi.hoisted() để các biến mock được khởi tạo TRƯỚC khi vi.mock factory chạy
const {
  mockDownloadFileText,
  mockListFolderContents,
  mockFindFileByName,
  mockFindSubFolderId,
  mockGetDriveClient,
  mockGetDriveFolderId,
  MockDriveNetworkOrQuotaError,
} = vi.hoisted(() => {
  class TestDriveNetworkError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "DriveNetworkOrQuotaError";
    }
  }
  return {
    mockDownloadFileText: vi.fn(),
    mockListFolderContents: vi.fn(),
    mockFindFileByName: vi.fn(),
    mockFindSubFolderId: vi.fn(),
    mockGetDriveClient: vi.fn(() => ({})),
    mockGetDriveFolderId: vi.fn(() => "fake-folder-id"),
    MockDriveNetworkOrQuotaError: TestDriveNetworkError,
  };
});

vi.mock("@/server/providers/google-drive", () => ({
  getDriveClient: mockGetDriveClient,
  getDriveFolderId: mockGetDriveFolderId,
  listFolderContents: mockListFolderContents,
  downloadFileText: mockDownloadFileText,
  findFileByName: mockFindFileByName,
  findSubFolderId: mockFindSubFolderId,
  DriveNetworkOrQuotaError: MockDriveNetworkOrQuotaError,
}));

// Cần import SAU khi mock
import { syncDriveContent } from "@/server/admin/drive-sync";
import { updateContentActivity, createContentActivity } from "@/server/admin/content-service";
import { createContentSource, createContentSegment } from "@/server/admin/content-sources-service";

// ── Test data ────────────────────────────────────────────────────────────────

const MANIFEST_VALID = `
version: 1
sources:
  - id: src-drive-test
    title: "Drive Test Source"
    kind: video
    review_state: approved
    url: https://youtube.com/watch?v=test

segments: []

activities:
  - id: W97
    mode: writing
    title: "Drive Sync Test Activity"
    review_state: approved
    duration_minutes: 15
    topic: medical
`;

const MANIFEST_INVALID_YAML = `
version: 1
activities: [unclosed
`;

const MANIFEST_NO_APPROVED = `
version: 1
activities:
  - id: W97
    mode: writing
    title: "Draft Only"
    review_state: draft
`;

// IDs dùng trong test — sẽ được clean up sau
const TEST_ACTIVITY_ID = "W97";
const TEST_SOURCE_ID = "src-drive-test";

// ── Setup: đảm bảo mock trả đúng folder structure ────────────────────────────

function setupMockDriveStructure(manifestContent: string) {
  mockListFolderContents.mockResolvedValue([
    { id: "manifest-file-id", name: "manifest.yaml", mimeType: "text/plain" },
    { id: "texts-folder-id", name: "texts", mimeType: "application/vnd.google-apps.folder" },
    { id: "transcripts-folder-id", name: "transcripts", mimeType: "application/vnd.google-apps.folder" },
  ]);

  mockDownloadFileText.mockImplementation(async (_drive: unknown, fileId: string) => {
    if (fileId === "manifest-file-id") return manifestContent;
    return null;
  });

  mockFindSubFolderId.mockImplementation(async (_drive: unknown, _parentId: string, name: string) => {
    if (name === "texts") return "texts-folder-id";
    if (name === "transcripts") return "transcripts-folder-id";
    if (name === "rubrics") return null;
    return null;
  });

  mockFindFileByName.mockResolvedValue(null);
}

// ── Cleanup DB before AND after tests ────────────────────────────────────────

async function cleanupTestData() {
  await db.delete(activities).where(eq(activities.id, TEST_ACTIVITY_ID));
  await db.delete(sources).where(eq(sources.id, TEST_SOURCE_ID));
  await db.delete(activities).where(eq(activities.id, "L97"));
  await db.delete(activities).where(eq(activities.id, "W95"));
  await db.delete(sourceSegments).where(eq(sourceSegments.id, "seg-drive-l97"));
  await db.delete(sourceSegments).where(eq(sourceSegments.id, "seg-drive-broken"));
  await db.delete(sourceSegments).where(eq(sourceSegments.id, "seg-admin-closure"));
  await db.delete(sources).where(eq(sources.id, "src-drive-l97"));
  await db.delete(sources).where(eq(sources.id, "src-closure-test"));
}

beforeAll(async () => {
  await cleanupTestData();
});

afterAll(async () => {
  await cleanupTestData();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("syncDriveContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDriveClient.mockReturnValue({});
    mockGetDriveFolderId.mockReturnValue("fake-folder-id");
  });

  it("dry-run: parse manifest hợp lệ → trả added list, không ghi DB", async () => {
    setupMockDriveStructure(MANIFEST_VALID);

    const result = await syncDriveContent({ dryRun: true });

    expect(result.dryRun).toBe(true);
    expect(result.errors.filter((e) => !e.message.startsWith("[warning]"))).toHaveLength(0);
    expect(result.conflicts).toHaveLength(0);

    const allMentioned = [...result.added, ...result.updated];
    expect(allMentioned).toContain("activity:W97");

    const dbRow = await db
      .select()
      .from(activities)
      .where(eq(activities.id, TEST_ACTIVITY_ID));
    expect(dbRow).toHaveLength(0);
  });

  it("live sync: ghi activity vào DB với origin=drive", async () => {
    setupMockDriveStructure(MANIFEST_VALID);

    const result = await syncDriveContent({ dryRun: false });

    expect(result.errors.filter((e) => !e.message.startsWith("[warning]"))).toHaveLength(0);
    const allMentioned = [...result.added, ...result.updated];
    expect(allMentioned).toContain("activity:W97");

    const dbRow = await db
      .select()
      .from(activities)
      .where(eq(activities.id, TEST_ACTIVITY_ID));
    expect(dbRow).toHaveLength(1);
    expect(dbRow[0].origin).toBe("drive");
    expect(dbRow[0].title).toBe("Drive Sync Test Activity");
  });

  it("conflict: activity có origin=admin không bị ghi đè", async () => {
    const updated = await updateContentActivity(TEST_ACTIVITY_ID, {
      title: "Admin Custom Activity Title",
      promptText: "Write a short paragraph about clinical communication.",
    });
    expect(updated).toBeDefined();
    expect(updated?.origin).toBe("admin");
    expect(updated?.title).toBe("Admin Custom Activity Title");

    setupMockDriveStructure(MANIFEST_VALID);

    const result = await syncDriveContent({ dryRun: false });

    expect(result.conflicts.length).toBeGreaterThan(0);
    const conflict = result.conflicts.find((c) => c.id === TEST_ACTIVITY_ID);
    expect(conflict).toBeDefined();
    expect(conflict?.kind).toBe("activity");

    const dbRow = await db
      .select()
      .from(activities)
      .where(eq(activities.id, TEST_ACTIVITY_ID));
    expect(dbRow).toHaveLength(1);
    expect(dbRow[0].origin).toBe("admin");
    expect(dbRow[0].title).toBe("Admin Custom Activity Title");

    await db
      .update(activities)
      .set({ origin: "drive" })
      .where(eq(activities.id, TEST_ACTIVITY_ID));
  });

  it("lỗi: manifest YAML không hợp lệ → trả errors, không ghi DB", async () => {
    setupMockDriveStructure(MANIFEST_INVALID_YAML);

    const result = await syncDriveContent({ dryRun: false });

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.added).toHaveLength(0);
    expect(result.updated).toHaveLength(0);
  });

  it("không có bài approved → kết quả rỗng, thống kê skipped bài draft", async () => {
    setupMockDriveStructure(MANIFEST_NO_APPROVED);

    const result = await syncDriveContent({ dryRun: true });

    expect(result.errors.filter((e) => !e.message.startsWith("[warning]"))).toHaveLength(0);
    expect(result.added).toHaveLength(0);
    expect(result.skipped).toContain("activity:W97");
  });

  it("lỗi cấu hình: thiếu env GOOGLE_SERVICE_ACCOUNT_JSON → error ngay lập tức", async () => {
    mockGetDriveClient.mockImplementation(() => {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set.");
    });

    const result = await syncDriveContent({ dryRun: true });

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain("GOOGLE_SERVICE_ACCOUNT_JSON");
  });

  it("lỗi cấu trúc: không có manifest.yaml trong folder → error", async () => {
    mockListFolderContents.mockResolvedValue([
      { id: "texts-folder-id", name: "texts", mimeType: "application/vnd.google-apps.folder" },
    ]);
    mockFindSubFolderId.mockResolvedValue("some-folder-id");

    const result = await syncDriveContent({ dryRun: true });

    expect(result.errors.some((e) => e.message.includes("manifest.yaml"))).toBe(true);
  });

  // ── Các test mới cho Vá 3 ───────────────────────────────────────────────────

  it("Vá 3.1: nạp questions_file thật từ Drive và ghi vào activities.questions", async () => {
    const MANIFEST_LISTENING = `
version: 1
sources:
  - id: src-drive-l97
    title: "Listening Source"
    kind: video
    review_state: approved
    url: https://youtube.com/watch?v=listening123
segments:
  - id: seg-drive-l97
    source_id: src-drive-l97
    transcript_file: transcripts/l97-transcript.txt
activities:
  - id: L97
    mode: listening
    title: "Listening Sync Test"
    review_state: approved
    segment_ids: [seg-drive-l97]
    questions_file: texts/l97-questions.yaml
`;

    const QUESTIONS_YAML = `
title: "Câu hỏi nghe hiểu L97"
questions:
  - id: "q1"
    prompt: "Câu hỏi nghe mẫu?"
    options:
      - id: "A"
        text: "Lựa chọn A"
      - id: "B"
        text: "Lựa chọn B"
    correct_option_id: "A"
    explanation: "Giải thích đáp án A"
    timestamp_reference: 15
`;

    setupMockDriveStructure(MANIFEST_LISTENING);

    mockFindFileByName.mockImplementation(async (_drive: unknown, _pId: string, name: string) => {
      if (name === "l97-transcript.txt") return { id: "trans-id", name };
      if (name === "l97-questions.yaml") return { id: "quest-id", name };
      return null;
    });

    mockDownloadFileText.mockImplementation(async (_drive: unknown, fileId: string) => {
      if (fileId === "manifest-file-id") return MANIFEST_LISTENING;
      if (fileId === "trans-id") return "0|10|Hello listener\n10|20|Second sentence";
      if (fileId === "quest-id") return QUESTIONS_YAML;
      return null;
    });

    const result = await syncDriveContent({ dryRun: false });
    expect(result.errors.filter((e) => !e.message.startsWith("[warning]"))).toHaveLength(0);

    // Kiểm tra DB
    const [actInDb] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, "L97"));

    expect(actInDb).toBeDefined();
    expect(actInDb.questionsFile).toBe("texts/l97-questions.yaml");
    expect(actInDb.questions).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qList = actInDb.questions as any[];
    expect(qList).toHaveLength(1);
    expect(qList[0].id).toBe("q1");
    expect(qList[0].correct_option_id).toBe("A");
  });

  it("Vá 3.2: lỗi network/quota Drive giữa chừng → dừng sync ngay, KHÔNG ghi nửa chừng", async () => {
    const MANIFEST_NETWORK_FAIL = `
version: 1
sources:
  - id: src-drive-fail
    title: "Fail Source"
    kind: article
    review_state: approved
segments:
  - id: seg-drive-fail
    source_id: src-drive-fail
    text_file: texts/fail-text.md
activities:
  - id: W95
    mode: writing
    title: "Fail Activity"
    review_state: approved
    segment_ids: [seg-drive-fail]
`;

    setupMockDriveStructure(MANIFEST_NETWORK_FAIL);

    mockFindFileByName.mockResolvedValue({ id: "file-fail-id", name: "fail-text.md" });

    // Giả lập download text file bị lỗi Network/Quota (ví dụ Google Drive 429 hoặc ECONNRESET)
    mockDownloadFileText.mockImplementation(async (_drive: unknown, fileId: string) => {
      if (fileId === "manifest-file-id") return MANIFEST_NETWORK_FAIL;
      if (fileId === "file-fail-id") {
        throw new MockDriveNetworkOrQuotaError("429 Too Many Requests / Quota Exceeded");
      }
      return null;
    });

    const result = await syncDriveContent({ dryRun: false });

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.message.includes("mạng hoặc hạn ngạch"))).toBe(true);

    // Kiểm tra DB: hoàn toàn KHÔNG có source nào được ghi nửa chừng
    const srcInDb = await db.select().from(sources).where(eq(sources.id, "src-drive-fail"));
    expect(srcInDb).toHaveLength(0);

    const actInDb = await db.select().from(activities).where(eq(activities.id, "W95"));
    expect(actInDb).toHaveLength(0);
  });

  it("Vá 3.3: activity tham chiếu segment bị lỗi tải file → activity bị loại bỏ và báo lỗi", async () => {
    const MANIFEST_BROKEN_SEG = `
version: 1
sources:
  - id: src-drive-test
    title: "Valid Source"
    kind: article
    review_state: approved
segments:
  - id: seg-drive-broken
    source_id: src-drive-test
    text_file: texts/missing-file.md
activities:
  - id: W95
    mode: writing
    title: "Broken Activity"
    review_state: approved
    segment_ids: [seg-drive-broken]
`;

    setupMockDriveStructure(MANIFEST_BROKEN_SEG);

    // File missing-file.md không tìm thấy (trả về null)
    mockFindFileByName.mockResolvedValue(null);

    const result = await syncDriveContent({ dryRun: false });

    // Báo lỗi segment thiếu file VÀ activity phụ thuộc bị bỏ qua
    expect(result.errors.some((e) => e.message.includes("thiếu file văn bản"))).toBe(true);
    expect(result.errors.some((e) => e.message.includes("tham chiếu segment") && e.message.includes("bị lỗi"))).toBe(true);

    // Activity không được ghi vào DB
    const actInDb = await db.select().from(activities).where(eq(activities.id, "W95"));
    expect(actInDb).toHaveLength(0);
  });

  it("Vá 3.4: conflict closure: manifest muốn sửa source đang được bài admin dùng → báo conflict", async () => {
    // 1. Tạo source và segment do admin tạo
    const closureSrcId = "src-closure-test";
    const closureSegId = "seg-admin-closure";
    const adminActId = "W95";

    await db.delete(activities).where(eq(activities.id, adminActId));
    await db.delete(sourceSegments).where(eq(sourceSegments.id, closureSegId));
    await db.delete(sources).where(eq(sources.id, closureSrcId));

    await createContentSource({ id: closureSrcId, title: "Admin Source", kind: "article" });
    await createContentSegment({ id: closureSegId, sourceId: closureSrcId, textContent: "Admin segment text" });
    await createContentActivity({
      id: adminActId,
      mode: "writing",
      title: "Admin Custom Activity",
      segmentIds: [closureSegId],
    });

    // Đặt origin của source thành 'seed' để kiểm tra tính bảo vệ thuần túy theo quan hệ closure
    await db.update(sources).set({ origin: "seed" }).where(eq(sources.id, closureSrcId));

    // 2. Manifest muốn ghi đè source closureSrcId (nhưng bài admin không nằm trong manifest)
    const MANIFEST_OVERWRITE_SOURCE = `
version: 1
sources:
  - id: ${closureSrcId}
    title: "Overwritten by drive"
    kind: article
    review_state: approved
segments: []
activities: []
`;

    setupMockDriveStructure(MANIFEST_OVERWRITE_SOURCE);

    const result = await syncDriveContent({ dryRun: false });

    // Source phải bị chặn và nằm trong conflicts[]
    const conflict = result.conflicts.find((c) => c.id === closureSrcId);
    expect(conflict).toBeDefined();
    expect(conflict?.kind).toBe("source");
    expect(conflict?.reason).toContain("đang được bài học của admin tham chiếu");

    // DB: Tiêu đề của source vẫn giữ nguyên là Admin Source
    const [srcInDb] = await db.select().from(sources).where(eq(sources.id, closureSrcId));
    expect(srcInDb.title).toBe("Admin Source");

    // Dọn dẹp
    await db.delete(activities).where(eq(activities.id, adminActId));
    await db.delete(sourceSegments).where(eq(sourceSegments.id, closureSegId));
    await db.delete(sources).where(eq(sources.id, closureSrcId));
  });
});
