/**
 * speakPhrase — phát âm cụm từ bằng Web Speech API (giọng en-US, tốc độ 0.9).
 * Huỷ phát âm đang chạy trước khi phát câu mới; no-op ngoài trình duyệt.
 */
export function speakPhrase(phrase: string, e?: React.MouseEvent): void {
  if (e) e.stopPropagation();
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(phrase);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
