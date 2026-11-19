"use client";

/** Bước 3 — Câu hỏi: form có cấu trúc (không sửa JSON thô). */
import QuestionsFields from "../questions-fields";
import type { WizardData } from "./wizard-types";

export default function StepQuestions({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Thêm câu hỏi trắc nghiệm cho bài nghe. Cần ít nhất 1 câu — mỗi câu có
        từ 2 lựa chọn trở lên và một đáp án đúng.
      </p>
      <QuestionsFields
        value={data.questions}
        onChange={(questions) => onChange({ questions })}
      />
    </div>
  );
}
