import { describe, expect, it } from "vitest";
import { createVocabularyRequestSchema } from "@/contracts/vocabulary";
import { buildCapturedVocabulary } from "@/features/session/shared/capture-context";

describe("captured vocabulary provenance", () => {
  it.each([
    ["book", "Approved textbook, trang 42"],
    ["text", "Writing activity W2"],
    ["video", "https://www.youtube.com/watch?v=approved · câu 12–18s"],
    ["feedback", "Bài nộp 123 · bản 2 · câu mẫu đề xuất"],
  ] as const)("keeps the caller's %s source and original sentence", (sourceType, sourceRef) => {
    const entry = buildCapturedVocabulary({ phrase: "clear", ipa: "/klɪə/", contextMeaning: "rõ ràng", selectedText: "clear", surroundingSentence: "  Keep the message clear.  ", sourceType, sourceRef });
    expect(createVocabularyRequestSchema.parse(entry)).toMatchObject({ source_type: sourceType, source_ref: sourceRef, original_sentence: "Keep the message clear.", my_attempt: "" });
  });
  it("uses the selection as context when no surrounding sentence is known without inventing a book", () => {
    expect(buildCapturedVocabulary({ phrase: "clear", ipa: "", contextMeaning: "rõ ràng", selectedText: " clear " })).toMatchObject({ source_type: "text", source_ref: "Nguồn chưa được ghi nhận", original_sentence: "clear" });
  });
});
