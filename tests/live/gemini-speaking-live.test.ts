/**
 * LIVE smoke test — gọi API Gemini THẬT (tốn token, cần GEMINI_API_KEY).
 *
 * Chạy chủ đích bằng `npm run test:live`. KHÔNG chạy trong npm test / CI.
 *
 * Mục đích duy nhất: phát hiện schema drift giữa response thật của model
 * và zod schema phía mình — loại kiểm chứng không mock được. Logic enforce
 * (not_assessable khi thiếu audio, hậu kiểm limitations y khoa) đã được cover
 * hermetic ở tests/unit/providers/speaking-enforcement.test.ts và
 * tests/unit/invariants/medical-reading-safety.test.ts — file này KHÔNG cần
 * test lại logic đó một cách chi tiết.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { describe, it, expect } from "vitest";
import { evaluateSpeaking, evaluateReading } from "@/server/providers/gemini";

describe("LIVE Gemini — smoke test schema drift (API thật, tốn token)", () => {
  it(
    "evaluateSpeaking không audio: response thật parse được schema + pronunciation not_assessable",
    async () => {
      const res = await evaluateSpeaking(
        null,
        "Hãy giới thiệu ngắn gọn về bản thân trong 1 phút như ở hội nghị khoa học."
      );

      // Parse được qua schema nghĩa là model thật vẫn trả đúng contract JSON.
      expect(res.feedback).toBeDefined();
      expect(typeof res.feedback.transcript).toBe("string");
      expect(res.feedback.pronunciation.status).toBe("not_assessable");
      for (const score of res.feedback.scores) {
        expect(score.kind).toBe("practice_estimate");
      }
    },
    90_000
  );

  it(
    "evaluateReading: response thật parse được schema + limitations có cảnh báo y khoa",
    async () => {
      const res = await evaluateReading(
        "Direct sonographic monitoring substantially minimizes the risk of accidental intravascular injection.",
        {
          mainIdea: "Siêu âm giảm nguy cơ tiêm nhầm mạch máu",
          translation:
            "Giám sát trực tiếp bằng siêu âm giảm thiểu đáng kể nguy cơ tiêm nhầm vào lòng mạch máu.",
          keyTerms: "intravascular injection: tiêm vào mạch máu",
        }
      );

      expect(res.feedback.observations.length).toBeGreaterThan(0);
      expect(res.feedback.limitations.toLowerCase()).toContain("khuyến nghị");
      for (const score of res.feedback.scores) {
        expect(score.kind).toBe("practice_estimate");
      }
    },
    90_000
  );
});
