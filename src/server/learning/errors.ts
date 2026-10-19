/**
 * Service-layer errors for the learning domain.
 * `statusCode` is read by mapServiceError() → unified error envelope.
 * Kept in one module so session/*, assessment/* and media services share
 * the same classes (routes may still import them via the service barrel).
 */
export class ValidationError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 422) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = statusCode;
  }
}

export class ConflictError extends Error {
  statusCode: number;
  existingSessionId: string;
  constructor(message: string, existingSessionId: string) {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409;
    this.existingSessionId = existingSessionId;
  }
}
