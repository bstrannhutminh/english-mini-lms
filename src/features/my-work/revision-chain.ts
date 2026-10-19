/**
 * Helpers thuần cho trang /my-work — tách ra để unit-test hermetic.
 *
 * - topPriorityObservations: Gemini trả observations đã xếp theo độ ưu tiên
 *   ("Tối đa 3–5 điểm góp ý ưu tiên nhất" — gemini/types.ts), nên Top-N = N phần tử đầu.
 * - buildRevisionLookup: dựng chuỗi bản sửa append-only từ parentId để
 *   hiển thị "Bản 2/3" và biết bản nào đã có bản sửa mới hơn.
 */

export interface RevisionChainItem {
  id: string;
  parentId: string | null;
  revision: number;
}

export interface RevisionInfo {
  /** Vị trí trong chuỗi nhìn thấy (1-based). Khớp `revision` khi đủ chuỗi. */
  position: number;
  /** Tổng số bản trong chuỗi (tính trên các bản đang có trong danh sách). */
  chainLength: number;
  /** Id bản cha (bản trước) nếu còn tồn tại trong danh sách. */
  parentId: string | null;
  /** Id bản sửa mới nhất (con trực tiếp) nếu có — đã được sửa lại. */
  childId: string | null;
}

/** Top-N góp ý ưu tiên — danh sách đã được AI xếp sẵn thứ tự. */
export function topPriorityObservations<T>(observations: T[], count = 3): T[] {
  return observations.slice(0, Math.max(0, count));
}

/**
 * Index phục vụ tra chuỗi: id → {parentId, childId}.
 * Nếu nhiều con cùng trỏ 1 cha (hiếm), giữ con đầu tiên gặp.
 */
export function buildRevisionLookup(items: RevisionChainItem[]) {
  const byId = new Map<string, RevisionChainItem>();
  const childOf = new Map<string, string>();

  for (const item of items) {
    byId.set(item.id, item);
    if (item.parentId && !childOf.has(item.parentId)) {
      childOf.set(item.parentId, item.id);
    }
  }

  return { byId, childOf };
}

/**
 * Thông tin vị trí của 1 submission trong chuỗi bản sửa.
 * Leo lên tới gốc (parentId null hoặc cha bị xoá/không có trong list),
 * rồi đi xuống đếm độ dài chuỗi. Chống vòng lặp bằng visited set.
 */
export function getRevisionInfo(
  item: RevisionChainItem,
  items: RevisionChainItem[]
): RevisionInfo {
  const { byId, childOf } = buildRevisionLookup(items);

  // Leo lên gốc
  let root = item;
  const seenUp = new Set<string>([item.id]);
  while (root.parentId) {
    const parent = byId.get(root.parentId);
    if (!parent || seenUp.has(parent.id)) break;
    root = parent;
    seenUp.add(parent.id);
  }

  // Đi xuống đếm chuỗi + ghi vị trí
  let position = 1;
  let chainLength = 0;
  let cursor: RevisionChainItem | undefined = root;
  const seenDown = new Set<string>();
  while (cursor && !seenDown.has(cursor.id)) {
    seenDown.add(cursor.id);
    chainLength += 1;
    if (cursor.id === item.id) position = chainLength;
    const nextId = childOf.get(cursor.id);
    cursor = nextId ? byId.get(nextId) : undefined;
  }

  const parentId = item.parentId && byId.has(item.parentId) ? item.parentId : null;
  const childId = childOf.get(item.id) ?? null;

  return { position, chainLength, parentId, childId };
}
