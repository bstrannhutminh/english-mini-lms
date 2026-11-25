/**
 * Logic thuần rải lịch ôn (due_at) cho từ vựng seed — dùng chung bởi:
 *   - scripts/seed.ts: từ mastery 0 nạp mới được rải 1–10 ngày thay vì
 *     đến hạn cùng một ngày (1.142 từ IELTS từng dồn vào một ngày duy nhất,
 *     làm warm-up flashcard quá tải).
 *   - scripts/stagger-vocab-due.mjs: remediation 1 lần cho dữ liệu production.
 *
 * Viết bằng .mjs thuần (không TypeScript) để cả tsx (seed.ts) lẫn node
 * (stagger-vocab-due.mjs) đều import được mà không cần build.
 */

/** Số ngày tối thiểu/tối đa rải lịch cho từ seed mới (mastery 0). */
export const STAGGER_MIN_DAYS = 1;
export const STAGGER_MAX_DAYS = 10;

/**
 * Hash FNV-1a 32-bit — deterministic: cùng input luôn ra cùng số.
 * Không dùng cho bảo mật; chỉ để rải đều lịch ôn.
 *
 * @param {string} input
 * @returns {number} số nguyên dương 32-bit
 */
export function stableHash(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // Nhân với FNV prime (16777619) bằng phép dịch bit để tránh tràn float.
    hash =
      (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>>
      0;
  }
  return hash >>> 0;
}

/**
 * Số ngày offset deterministic trong [minDays, maxDays] cho một khoá.
 *
 * @param {string} key khoá deterministic (ví dụ `${learnerId}:${phrase}`)
 * @param {number} [minDays]
 * @param {number} [maxDays]
 * @returns {number} số ngày nguyên trong khoảng
 */
export function staggeredOffsetDays(key, minDays = STAGGER_MIN_DAYS, maxDays = STAGGER_MAX_DAYS) {
  const span = Math.max(1, maxDays - minDays + 1);
  return minDays + (stableHash(key) % span);
}

/**
 * dueAt rải cho từ seed: `now` + 1–10 ngày, deterministic theo key.
 * Cùng (key, now) luôn ra cùng kết quả → chạy seed lại không xáo lịch
 * của từ sẽ nạp (thực tế seed bỏ qua từ đã tồn tại, nhưng deterministic
 * giúp so kết quả giữa các môi trường dev/staging).
 *
 * @param {string} key
 * @param {Date} now mốc hiện tại (inject để test deterministic)
 * @returns {Date}
 */
export function staggeredDueAt(key, now) {
  const days = staggeredOffsetDays(key);
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Khoá rải lịch cho từ seed mới trong seed.ts.
 *
 * @param {string} learnerId
 * @param {string} phrase
 */
export function seedVocabStaggerKey(learnerId, phrase) {
  return `${learnerId}:${phrase}`;
}
