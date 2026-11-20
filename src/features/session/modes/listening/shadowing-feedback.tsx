import type { SpeakingFeedback } from "@/contracts/submission";

/** Audio-based feedback must keep its transcript uncertainty and assessment limits. */
export function ShadowingFeedback({ result }: { result: SpeakingFeedback }) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-primary-soft p-4 text-base leading-relaxed text-text">
      <h3 className="mb-1 font-semibold text-primary-dark">Nhận xét bản ghi âm</h3>
      <p>{result.pronunciation?.status === "not_assessable" ? "Chưa đánh giá được phát âm. " : ""}{result.pronunciation?.notes}</p>
      {result.transcript && <p className="mt-2">AI nghe được: <em>&ldquo;{result.transcript}&rdquo;</em>{typeof result.transcript_confidence === "number" ? ` (Độ tin cậy: ${Math.round(result.transcript_confidence * 100)}%)` : ""}</p>}
      {result.observations.length > 0 && <div className="mt-3"><h4 className="font-semibold">Điểm cần thử lại</h4><ul className="mt-1 list-disc space-y-2 pl-5">{result.observations.map((observation, index) => <li key={index}>{observation.suggestion}{observation.retry_prompt && <p className="mt-1">{observation.retry_prompt}</p>}</li>)}</ul></div>}
      {result.limitations && <p className="mt-3 text-text-secondary">Giới hạn: {result.limitations}</p>}
    </div>
  );
}
