import type { CreateVocabularyRequest } from "@/contracts/vocabulary";

export type CaptureSourceType = "book" | "text" | "video" | "feedback";

/** Keep the source chosen by the caller with the captured phrase and sentence. */
export function buildCapturedVocabulary(input: {
  phrase: string;
  ipa: string;
  contextMeaning: string;
  selectedText: string;
  surroundingSentence?: string;
  sourceRef?: string;
  sourceType?: CaptureSourceType;
}): CreateVocabularyRequest {
  return {
    phrase: input.phrase,
    ipa: input.ipa,
    context_meaning: input.contextMeaning,
    original_sentence: input.surroundingSentence?.trim() || input.selectedText.trim(),
    source_ref: input.sourceRef?.trim() || "Nguồn chưa được ghi nhận",
    source_type: input.sourceType ?? "text",
    my_attempt: "",
  };
}
