/**
 * Session domain services — barrel re-export giữ tương thích
 * (`@/server/learning/service`, `@/server/learning/session.service`).
 * Implementation tách theo mối quan tâm trong ./session/.
 */
export { ValidationError, ConflictError } from "./errors";
export type { CreateSessionOptions } from "./session/create-session";
export { createSession } from "./session/create-session";
export { recordSessionEvent } from "./session/record-session-event";
export { saveDraft } from "./session/save-draft";
export {
  getSessionDetails,
  type SessionDetailsResult,
} from "./session/get-session-details";
export {
  parseTranscriptLines,
  canRevealTranscript,
  type TranscriptSegment,
  type ListeningSessionData,
} from "./session/listening-session-data";
