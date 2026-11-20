import { describe, expect, it } from "vitest";
import { settingsSubmissionSchema } from "@/contracts/settings";

const submission = {
  id: "11111111-1111-4111-8111-111111111111",
  revision: 1,
  createdAt: "2026-11-20T00:00:00.000Z",
  mediaId: null,
  activityTitle: "Email xin tham dự hội nghị",
  activityMode: "writing",
};

describe("settings submission activity identifiers", () => {
  it.each(["W1", "R1", "IL1"])("accepts curriculum activity code %s", (activityId) => {
    expect(settingsSubmissionSchema.safeParse({ ...submission, activityId }).success).toBe(true);
  });

  it("still rejects invalid submission UUIDs and empty activity codes", () => {
    expect(settingsSubmissionSchema.safeParse({ ...submission, activityId: "" }).success).toBe(false);
    expect(settingsSubmissionSchema.safeParse({ ...submission, id: "W1", activityId: "W1" }).success).toBe(false);
  });
});
