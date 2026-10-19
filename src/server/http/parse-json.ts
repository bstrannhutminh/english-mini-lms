/**
 * parseJson(req, schema) — parse + validate a JSON request body.
 * Throws ApiRouteError: 400 for malformed JSON, 422 for schema violations
 * with per-field messages (converted to the error envelope by mapServiceError
 * inside withLearner/withAdmin).
 */
import type { z } from "zod";
import { ApiRouteError } from "./errors";

export async function parseJson<S extends z.ZodType>(
  req: Request,
  schema: S
): Promise<z.infer<S>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiRouteError(
      400,
      "invalid_json",
      "Body phải là JSON hợp lệ."
    );
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "_";
      if (!fields[path]) fields[path] = issue.message;
    }
    throw new ApiRouteError(422, "validation_failed", "Dữ liệu không hợp lệ.", {
      fields,
    });
  }

  return parsed.data;
}
