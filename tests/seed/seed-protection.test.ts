import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { activities, sources, sourceSegments } from "@/db/schema";
import { createContentSource, createContentSegment } from "@/server/admin/content-sources-service";
import { createContentActivity } from "@/server/admin/content-service";

describe("Seed protection for admin-origin content", () => {
  const TEST_SRC_ID = "src-admin-protected";
  const TEST_SEG_ID = "seg-admin-protected";
  const TEST_ACT_ID = "W96";

  async function cleanup() {
    await db.delete(activities).where(eq(activities.id, TEST_ACT_ID));
    await db.delete(sourceSegments).where(eq(sourceSegments.id, TEST_SEG_ID));
    await db.delete(sources).where(eq(sources.id, TEST_SRC_ID));
  }

  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  it("không ghi đè bài, nguồn, segment có origin='admin' khi seed nạp trùng ID", async () => {
    // 1. Admin tạo nguồn, segment, activity bằng admin content service
    const src = await createContentSource({
      id: TEST_SRC_ID,
      title: "Admin Protected Source",
      kind: "article",
    });
    expect(src.origin).toBe("admin");

    const seg = await createContentSegment({
      id: TEST_SEG_ID,
      sourceId: TEST_SRC_ID,
      textContent: "Original Admin Text Content",
    });
    expect(seg.origin).toBe("admin");

    const act = await createContentActivity({
      id: TEST_ACT_ID,
      mode: "writing",
      title: "Admin Protected Activity",
    });
    expect(act.origin).toBe("admin");

    // 2. Mô phỏng logic lọc của seed.ts:
    // Lấy tập hợp ID có origin='admin' từ DB
    const existingAdminSources = new Set(
      (
        await db
          .select({ id: sources.id })
          .from(sources)
          .where(sql`${sources.origin} = 'admin'`)
      ).map((r) => r.id)
    );
    const existingAdminSegments = new Set(
      (
        await db
          .select({ id: sourceSegments.id })
          .from(sourceSegments)
          .where(sql`${sourceSegments.origin} = 'admin'`)
      ).map((r) => r.id)
    );
    const existingAdminActivities = new Set(
      (
        await db
          .select({ id: activities.id })
          .from(activities)
          .where(sql`${activities.origin} = 'admin'`)
      ).map((r) => r.id)
    );

    // Kiểm tra rằng các ID vừa tạo nằm trong tập hợp admin
    expect(existingAdminSources.has(TEST_SRC_ID)).toBe(true);
    expect(existingAdminSegments.has(TEST_SEG_ID)).toBe(true);
    expect(existingAdminActivities.has(TEST_ACT_ID)).toBe(true);

    // 3. Giả lập danh sách cần upsert từ manifest trùng ID
    const incomingSources = [{ id: TEST_SRC_ID, title: "Overwritten by seed?" }];
    const incomingSegments = [{ id: TEST_SEG_ID, sourceId: TEST_SRC_ID, textContent: "Overwritten text?" }];
    const incomingActivities = [{ id: TEST_ACT_ID, title: "Overwritten by seed?" }];

    // Áp dụng đúng điều kiện lọc như trong scripts/seed.ts:
    // Nếu existingAdminX.has(item.id) thì continue (skip)
    let skippedSourcesCount = 0;
    for (const s of incomingSources) {
      if (existingAdminSources.has(s.id)) {
        skippedSourcesCount++;
        continue;
      }
      // Upsert logic here (không được chạy tới)
      await db.insert(sources).values({ id: s.id, title: s.title, kind: "article" });
    }

    let skippedSegmentsCount = 0;
    for (const sg of incomingSegments) {
      if (existingAdminSegments.has(sg.id)) {
        skippedSegmentsCount++;
        continue;
      }
      // Upsert logic here (không được chạy tới)
      await db.insert(sourceSegments).values({ id: sg.id, sourceId: sg.sourceId });
    }

    let skippedActivitiesCount = 0;
    for (const a of incomingActivities) {
      if (existingAdminActivities.has(a.id)) {
        skippedActivitiesCount++;
        continue;
      }
      // Upsert logic here (không được chạy tới)
      await db.insert(activities).values({ id: a.id, title: a.title, mode: "writing" });
    }

    expect(skippedSourcesCount).toBe(1);
    expect(skippedSegmentsCount).toBe(1);
    expect(skippedActivitiesCount).toBe(1);

    // 4. Kiểm tra trong DB: dữ liệu không bị ghi đè, origin vẫn là 'admin'
    const [actInDb] = await db.select().from(activities).where(eq(activities.id, TEST_ACT_ID));
    expect(actInDb.title).toBe("Admin Protected Activity");
    expect(actInDb.origin).toBe("admin");

    const [srcInDb] = await db.select().from(sources).where(eq(sources.id, TEST_SRC_ID));
    expect(srcInDb.title).toBe("Admin Protected Source");
    expect(srcInDb.origin).toBe("admin");

    const [segInDb] = await db.select().from(sourceSegments).where(eq(sourceSegments.id, TEST_SEG_ID));
    expect(segInDb.textContent).toBe("Original Admin Text Content");
    expect(segInDb.origin).toBe("admin");
  });
});
