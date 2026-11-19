/**
 * Lỗi domain của vocabulary — route layer map qua mapServiceError()
 * theo `statusCode` (400 validation, 404 not-found…).
 */
export class ValidationError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 422) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = statusCode;
  }
}
