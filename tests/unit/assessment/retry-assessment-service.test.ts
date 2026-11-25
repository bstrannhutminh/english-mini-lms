/**
 * retryAssessment — test orchestration THẬT của service với db interface
 * tối thiểu (select/update chain giả) + evaluate/persist mock ở ranh giới.
 *
 * Khác với retry-guard-and-sweeper.test.ts (test pure logic isAssessmentStuck/
 * checkRetryAllowed), file này kiểm chứng THỨ TỰ điều phối của service thật:
 *   sweeper chạy TRƯỚC guard → guard chặn evaluate → ownership → đánh dấu
 *   processing (runVersion+1) TRƯỚC khi evaluate → evaluate lỗi thì đánh
 *   failed + throw 503 tiếng Việt.
 *
 * Đây là mức test cao nhất khả thi hermetic: các bước SQL thật (join, giá trị
 * row) vẫn cần integration test với TEST_DATABASE_URL — xem report batch F.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { STUCK_ASSESSMENT_MESSAGE } from "@/server/learning/assessment/assessment-status";

/* ── db interface tối thiểu: queue kết quả select + log update ── */

const h = vi.hoisted(() => {
  return {
    selectResults: [] as unknown[][],
    updateSets: [] as Record<string, unknown>[],
    selectFn: vi.fn(),
    updateFn: vi.fn(),
  };
});

vi.mock("@/db", () => {
  function makeSelectChain(rows: unknown[]) {
    const chain: Record<string, unknown> = {};
    chain.from = () => chain;
    chain.where = () => chain;
    chain.orderBy = () => chain;
    chain.limit = () => Promise.resolve(rows);
    return chain;
  }
  h.selectFn.mockImplementation(() =>
    makeSelectChain(h.selectResults.shift() ?? [])
  );
  h.updateFn.mockImplementation(() => {
    const chain: Record<string, unknown> = {};
    chain.set = (v: Record<string, unknown>) => {
      h.updateSets.push(v);
      return chain;
    };
    chain.where = () => Promise.resolve([]);
    return chain;
  });
  return { db: { select: h.selectFn, update: h.updateFn } };
});

vi.mock("@/server/learning/assessment/evaluate-submission", () => ({
  evaluateSubmission: vi.fn(),
}));
vi.mock("@/server/learning/assessment/persist-evaluation", () => ({
  persistEvaluationResult: vi.fn(),
}));

import { retryAssessment } from "@/server/learning/assessment/retry-assessment";
import { evaluateSubmission } from "@/server/learning/assessment/evaluate-submission";
import { persistEvaluationResult } from "@/server/learning/assessment/persist-evaluation";
import { MAX_ASSESSMENT_ATTEMPTS } from "@/server/learning/limits";

const evaluateMock = vi.mocked(evaluateSubmission);
const persistMock = vi.mocked(persistEvaluationResult);

const LEARNER = "learner-A";
const OTHER = "learner-B";

function assessmentRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "assess-1",
    submissionId: "sub-1",
    learnerId: LEARNER,
    kind: "ai_feedback",
    runVersion: 1,
    status: "failed",
    resultRef: "Gemini timeout",
    createdAt: new Date("2026-11-20T01:00:00Z"),
    updatedAt: new Date(),
    ...overrides,
  };
}

function submissionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "sub-1",
    sessionId: "sess-1",
    learnerId: LEARNER,
    revision: 1,
    parentId: null,
    modality: "text",
    body: "bài làm của learner",
    confirmedTranscript: null,
    mediaId: null,
    assisted: false,
    submittedAt: new Date("2026-11-20T01:00:00Z"),
    deletedAt: null,
    createdAt: new Date("2026-11-20T01:00:00Z"),
    updatedAt: new Date("2026-11-20T01:00:00Z"),
    ...overrides,
  };
}

/** Queue đủ 4 select của happy path: assessment → submission → session → activity. */
function queueHappyPath(assessment: unknown, submission: unknown = submissionRow()) {
  h.selectResults.push(
    [assessment],
    [submission],
    [{ activityId: "W1" }],
    [{ id: "W1", mode: "writing", rubricJson: null, promptText: "Đề" }]
  );
}

beforeEach(() => {
  h.selectResults.length = 0;
  h.updateSets.length = 0;
  h.selectFn.mockClear();
  h.updateFn.mockClear();
  evaluateMock.mockReset();
  persistMock.mockReset();
  // Mặc định: evaluate thành công, persist trả feedback giả.
  evaluateMock.mockResolvedValue({
    feedback: {
      observations: [],
      strengths: [],
      next_action: "x",
      limitations: "y",
      scores: [],
    },
    modelName: "gemini-2.5-flash",
    tokenInput: 1,
    tokenOutput: 1,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  persistMock.mockResolvedValue({ id: "fb-1" } as any);
});

describe("retryAssessment — điều phối thật, db giả tối thiểu", () => {
  it("assessment không tồn tại → 404, không evaluate", async () => {
    h.selectResults.push([]); // select đầu trả rỗng
    await expect(retryAssessment("assess-mất", LEARNER)).rejects.toMatchObject({
      statusCode: 404,
      message: expect.stringContaining("Không tìm thấy lượt chấm bài"),
    });
    expect(evaluateMock).not.toHaveBeenCalled();
  });

  it("feedback_ready → 409 ngay từ guard, KHÔNG select thêm, KHÔNG evaluate", async () => {
    h.selectResults.push([assessmentRow({ status: "feedback_ready" })]);
    await expect(retryAssessment("assess-1", LEARNER)).rejects.toMatchObject({
      statusCode: 409,
    });
    // Guard chạy ngay sau select assessment — không tốn thêm query nào.
    expect(h.selectFn).toHaveBeenCalledTimes(1);
    expect(evaluateMock).not.toHaveBeenCalled();
    expect(h.updateFn).not.toHaveBeenCalled();
  });

  it("failed nhưng runVersion đạt cap → 422 hết lượt, không evaluate", async () => {
    h.selectResults.push([
      assessmentRow({ status: "failed", runVersion: MAX_ASSESSMENT_ATTEMPTS }),
    ]);
    await expect(retryAssessment("assess-1", LEARNER)).rejects.toMatchObject({
      statusCode: 422,
    });
    expect(evaluateMock).not.toHaveBeenCalled();
  });

  it("learner khác + không phải admin → 403 sau khi đọc submission", async () => {
    h.selectResults.push(
      [assessmentRow({ status: "failed", learnerId: OTHER })],
      [submissionRow({ learnerId: OTHER })]
    );
    await expect(retryAssessment("assess-1", LEARNER, false)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(evaluateMock).not.toHaveBeenCalled();
  });

  it("admin được chấm lại bài của learner khác", async () => {
    queueHappyPath(assessmentRow({ status: "failed", learnerId: OTHER }), submissionRow({ learnerId: OTHER }));
    const result = await retryAssessment("assess-1", LEARNER, true);
    expect(result.success).toBe(true);
    expect(evaluateMock).toHaveBeenCalledTimes(1);
  });

  it("happy path: processing được đánh dấu TRƯỚC khi evaluate, runVersion+1", async () => {
    queueHappyPath(assessmentRow({ status: "failed", runVersion: 1 }));

    const result = await retryAssessment("assess-1", LEARNER);
    expect(result.success).toBe(true);
    expect(result.feedback).toEqual({ id: "fb-1" });

    // 1. Update đầu tiên: processing + runVersion 2 (lượt thất bại cũng tính cap).
    expect(h.updateSets[0]).toMatchObject({ status: "processing", runVersion: 2 });

    // 2. Thứ tự: mark processing xảy ra TRƯỚC evaluate.
    const firstUpdateOrder = h.updateFn.mock.invocationCallOrder[0];
    const evaluateOrder = evaluateMock.mock.invocationCallOrder[0];
    expect(firstUpdateOrder).toBeLessThan(evaluateOrder);

    // 3. persist nhận runVersion mới + replaceErrorObservations (dọn lỗi cũ khi retry).
    expect(persistMock).toHaveBeenCalledWith(
      expect.objectContaining({
        assessmentId: "assess-1",
        runVersion: 2,
        replaceErrorObservations: true,
      })
    );
  });

  it("evaluate ném lỗi → assessment được đánh failed + throw 503 tiếng Việt", async () => {
    queueHappyPath(assessmentRow({ status: "failed", runVersion: 1 }));
    evaluateMock.mockRejectedValueOnce(new Error("fetch failed: ECONNRESET"));

    await expect(retryAssessment("assess-1", LEARNER)).rejects.toMatchObject({
      statusCode: 503,
      message: expect.stringContaining("Chấm lại không thành công"),
    });

    // Update cuối phải là mark failed — assessment không bị treo ở processing.
    const lastSet = h.updateSets[h.updateSets.length - 1];
    expect(lastSet.status).toBe("failed");
    expect(String(lastSet.resultRef)).toContain("Bài nộp đã được lưu");
    expect(persistMock).not.toHaveBeenCalled();
  });

  it("lỗi EnvError không lộ tên biến môi trường trong message trả về", async () => {
    queueHappyPath(assessmentRow({ status: "failed", runVersion: 1 }));
    const envErr = new Error("Thiếu biến môi trường: GEMINI_API_KEY");
    envErr.name = "EnvError";
    evaluateMock.mockRejectedValueOnce(envErr);

    const err = await retryAssessment("assess-1", LEARNER).catch((e) => e);
    expect(err.statusCode).toBe(503);
    expect(err.message).not.toContain("GEMINI_API_KEY");
  });

  it("assessment kẹt (processing quá hạn) → sweeper đánh failed TRƯỚC rồi mới retry", async () => {
    const stuck = assessmentRow({
      status: "processing",
      runVersion: 1,
      updatedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 giờ trước — quá hạn sweeper
    });
    queueHappyPath(stuck);

    const result = await retryAssessment("assess-1", LEARNER);
    expect(result.success).toBe(true);

    // Update đầu tiên phải là sweeper đánh failed với message chuẩn…
    expect(h.updateSets[0]).toMatchObject({
      status: "failed",
      resultRef: STUCK_ASSESSMENT_MESSAGE,
    });
    // …rồi mới tới mark processing của lượt retry.
    expect(h.updateSets[1]).toMatchObject({ status: "processing", runVersion: 2 });
    expect(evaluateMock).toHaveBeenCalledTimes(1);
  });

  it("processing CÒN HẠN (không kẹt) → 409 đang chấm, sweeper không can thiệp", async () => {
    h.selectResults.push([
      assessmentRow({ status: "processing", updatedAt: new Date() }),
    ]);
    await expect(retryAssessment("assess-1", LEARNER)).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(h.updateFn).not.toHaveBeenCalled();
    expect(evaluateMock).not.toHaveBeenCalled();
  });
});
