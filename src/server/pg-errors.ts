/**
 * Nhận diện lỗi Postgres từ postgres-js/drizzle.
 * 23505 = unique_violation — dùng để chuyển race condition thành lỗi nghiệp vụ
 * có thông báo tiếng Việt thay vì 500 thô.
 * Lưu ý: drizzle gói lỗi driver trong DrizzleQueryError — mã PG nằm ở `.cause`
 * (có thể lồng nhiều lớp), nên phải lần theo chuỗi cause.
 */
export function isUniqueViolation(err: unknown): boolean {
  let cur: unknown = err;
  for (let depth = 0; depth < 5; depth++) {
    if (typeof cur !== "object" || cur === null) return false;
    if ((cur as { code?: string }).code === "23505") return true;
    cur = (cur as { cause?: unknown }).cause;
  }
  return false;
}
