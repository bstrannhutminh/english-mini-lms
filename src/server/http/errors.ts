/**
 * Route-layer error carrying HTTP status + unified error-envelope fields.
 * Thrown by helpers (parseJson) and optionally by services; converted to a
 * NextResponse by mapServiceError().
 */
export class ApiRouteError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  /** Extra top-level keys merged into the JSON body (e.g. `sessionId` on 409). */
  extra?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    options?: { fields?: Record<string, string>; extra?: Record<string, unknown> }
  ) {
    super(message);
    this.name = "ApiRouteError";
    this.status = status;
    this.code = code;
    this.fields = options?.fields;
    this.extra = options?.extra;
  }
}
