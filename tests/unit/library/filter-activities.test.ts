import { describe, it, expect } from "vitest";
import { filterLibraryActivities } from "@/features/library/filter-activities";
import type { ActivityListItemContract } from "@/contracts/library";
import { UNCATEGORIZED_TOPIC } from "@/lib/topics";

const SAMPLE: ActivityListItemContract[] = [
  {
    id: "W1",
    slot: "W1",
    mode: "writing",
    title: "Email xin tham dự hội nghị",
    objective: "Viết email 120–150 từ trang trọng",
    durationMinutes: 20,
    difficulty: "intermediate",
    purpose: "baseline",
    output: "text",
    topic: "giao-tiep-hoi-nghi",
    learningStatus: "not_started",
    submissionCount: 0,
  },
  {
    id: "R1",
    slot: "R1",
    mode: "reading",
    title: "Đọc–dịch sổ tay siêu âm tr.42",
    objective: "Dịch trung thành đoạn siêu âm cơ xương khớp",
    durationMinutes: 25,
    difficulty: "intermediate",
    purpose: "practice",
    output: "text",
    topic: "doc-sach-y-khoa",
    learningStatus: "in_progress",
    submissionCount: 0,
  },
  {
    id: "ielts-L1",
    slot: "IL1",
    mode: "ielts-listening",
    title: "IELTS Listening: Hội thảo y khoa",
    objective: "Nghe hiểu 3 câu trắc nghiệm",
    durationMinutes: 30,
    difficulty: "advanced",
    purpose: "assessment",
    output: "text",
    topic: "luyen-ielts",
    learningStatus: "completed",
    submissionCount: 2,
  },
  {
    id: "S1",
    slot: "S1",
    mode: "speaking",
    title: "Tự giới thiệu bác sĩ lâm sàng",
    objective: null,
    durationMinutes: 15,
    difficulty: "beginner",
    purpose: "baseline",
    output: "audio",
    topic: null,
    learningStatus: "not_started",
    submissionCount: 0,
  },
];

describe("filterLibraryActivities", () => {
  it("filters by topic including uncategorized", () => {
    const byTopic = filterLibraryActivities(SAMPLE, {
      topic: "doc-sach-y-khoa",
      skill: "all",
      status: "all",
      query: "",
    });
    expect(byTopic.map((a) => a.id)).toEqual(["R1"]);

    const uncat = filterLibraryActivities(SAMPLE, {
      topic: UNCATEGORIZED_TOPIC,
      skill: "all",
      status: "all",
      query: "",
    });
    expect(uncat.map((a) => a.id)).toEqual(["S1"]);
  });

  it("maps ielts-* under both its core skill and the dedicated IELTS filter", () => {
    const listening = filterLibraryActivities(SAMPLE, {
      topic: null,
      skill: "listening",
      status: "all",
      query: "",
    });
    expect(listening.map((a) => a.id)).toEqual(["ielts-L1"]);

    const ieltsOnly = filterLibraryActivities(SAMPLE, {
      topic: null,
      skill: "ielts",
      status: "all",
      query: "",
    });
    expect(ieltsOnly.map((a) => a.id)).toEqual(["ielts-L1"]);
  });

  it("filters by learning status accurately", () => {
    const inProgress = filterLibraryActivities(SAMPLE, {
      topic: null,
      skill: "all",
      status: "in_progress",
      query: "",
    });
    expect(inProgress.map((a) => a.id)).toEqual(["R1"]);

    const completed = filterLibraryActivities(SAMPLE, {
      topic: null,
      skill: "all",
      status: "completed",
      query: "",
    });
    expect(completed.map((a) => a.id)).toEqual(["ielts-L1"]);
  });

  it("matches Vietnamese queries accent-insensitively across title and objective", () => {
    const res = filterLibraryActivities(SAMPLE, {
      topic: null,
      skill: "all",
      status: "all",
      query: "sieu am co xuong khop",
    });
    expect(res.map((a) => a.id)).toEqual(["R1"]);
  });
});
