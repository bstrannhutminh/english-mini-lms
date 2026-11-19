export interface WordTarget { min: number; max: number | null }

/** Display only word counts explicitly stated in the approved prompt. */
export function resolveWordTarget(prompt: string | null): WordTarget | null {
  if (!prompt) return null;
  const range = prompt.match(/\b(\d+)\s*[-–—]\s*(\d+)\s*(?:từ|words?)(?=\s|[.,;:!?)]|$)/iu);
  if (range) {
    const min = Number(range[1]), max = Number(range[2]);
    if (min > 0 && max >= min) return { min, max };
  }
  const minimum = prompt.match(/(?:at least|minimum(?: of)?|tối thiểu)\s+(\d+)\s*(?:từ|words?)/iu);
  return minimum ? { min: Number(minimum[1]), max: null } : null;
}
