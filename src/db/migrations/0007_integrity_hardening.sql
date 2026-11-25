-- 0007_integrity_hardening — VIẾT TAY (không qua drizzle-kit generate) vì cần
-- partial unique indexes + trigger append-only tùy chỉnh.
-- Mọi statement đều idempotent (IF NOT EXISTS / DO block / CREATE OR REPLACE)
-- để chạy lại an toàn, additive — không phá dữ liệu hiện có.
--
-- Apply production: node scripts/apply-migration-0007.mjs (có preflight + transaction).
-- Môi trường khác: npm run db:migrate (drizzle migrator tự chạy trong transaction).

-- ── a. Indexes phục vụ query pattern chính ────────────────────────────────

-- Phiên đang mở / phiên gần đây của learner (today, my-work, conflict check)
CREATE INDEX IF NOT EXISTS learning_sessions_learner_status_updated_idx
  ON learning_sessions (learner_id, status, updated_at DESC);
--> statement-breakpoint

-- Tra phiên theo bài học của learner (picker xoay inventory, conflict check)
CREATE INDEX IF NOT EXISTS learning_sessions_learner_activity_status_idx
  ON learning_sessions (learner_id, activity_id, status);
--> statement-breakpoint

-- Danh sách bài nộp của learner (my-work — lọc soft-delete, mới nhất trước)
CREATE INDEX IF NOT EXISTS submissions_learner_deleted_submitted_idx
  ON submissions (learner_id, deleted_at, submitted_at DESC);
--> statement-breakpoint

-- Chuỗi revision theo parent (xem lịch sử bản sửa của một bài gốc)
CREATE INDEX IF NOT EXISTS submissions_parent_learner_deleted_submitted_idx
  ON submissions (parent_id, learner_id, deleted_at, submitted_at DESC);
--> statement-breakpoint

-- Bài nộp của một phiên (chống nộp trùng, trang feedback)
CREATE INDEX IF NOT EXISTS submissions_session_learner_deleted_idx
  ON submissions (session_id, learner_id, deleted_at);
--> statement-breakpoint

-- Lượt chấm mới nhất của một submission (feedback, retry, sweeper)
CREATE INDEX IF NOT EXISTS assessments_submission_created_idx
  ON assessments (submission_id, created_at DESC);
--> statement-breakpoint

-- Từ đến hạn ôn của learner (badge, flashcard, micro-challenge)
CREATE INDEX IF NOT EXISTS vocabulary_vault_learner_due_idx
  ON vocabulary_vault (learner_id, due_at);
--> statement-breakpoint

-- Bản nháp của một phiên (autosave, khôi phục khi mở lại phiên)
CREATE INDEX IF NOT EXISTS drafts_session_learner_idx
  ON drafts (session_id, learner_id);
--> statement-breakpoint

-- ── b. Unique partial indexes — chống double-tap/race tạo trùng ───────────

-- Tối đa 1 phiên ĐANG MỞ (ready/active/paused) cho mỗi cặp learner+activity.
-- Phiên completed/abandoned là terminal nên không chặn tạo phiên mới.
-- Backstop DB cho check-then-insert trong createSession.
CREATE UNIQUE INDEX IF NOT EXISTS learning_sessions_one_open_per_activity
  ON learning_sessions (learner_id, activity_id)
  WHERE status IN ('ready', 'active', 'paused');
--> statement-breakpoint

-- Tối đa 1 draft cho mỗi cặp session+learner (drafts không có soft-delete).
-- Backstop DB cho autosave đồng thời trong saveDraft.
CREATE UNIQUE INDEX IF NOT EXISTS drafts_one_per_session_learner
  ON drafts (session_id, learner_id);
--> statement-breakpoint

-- ── c. Self-FK submissions.parent_id → submissions.id ─────────────────────
-- RESTRICT (không cascade): submissions append-only, xoá cứng parent khi còn
-- revision con là phi logic — soft-delete vẫn hoạt động bình thường vì đó là
-- UPDATE, không phải DELETE.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'submissions_parent_id_submissions_id_fk'
      AND conrelid = 'public.submissions'::regclass
  ) THEN
    ALTER TABLE submissions
      ADD CONSTRAINT submissions_parent_id_submissions_id_fk
      FOREIGN KEY (parent_id) REFERENCES submissions(id) ON DELETE RESTRICT;
  END IF;
END $$;
--> statement-breakpoint

-- ── d. Trigger append-only cho submissions ────────────────────────────────
-- Chặn UPDATE vào cột immutable (nội dung bài nộp + định danh + audit fields).
-- CHO PHÉP: deleted_at/updated_at (soft-delete) và confirmed_transcript
-- (transcript người học xác nhận — cột PATCH hợp lệ duy nhất theo invariant).

CREATE OR REPLACE FUNCTION submissions_enforce_append_only()
RETURNS trigger AS $$
BEGIN
  IF NEW.body IS DISTINCT FROM OLD.body
     OR NEW.assisted IS DISTINCT FROM OLD.assisted
     OR NEW.session_id IS DISTINCT FROM OLD.session_id
     OR NEW.learner_id IS DISTINCT FROM OLD.learner_id
     OR NEW.revision IS DISTINCT FROM OLD.revision
     OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
     OR NEW.parent_id IS DISTINCT FROM OLD.parent_id
     OR NEW.media_id IS DISTINCT FROM OLD.media_id
     OR NEW.modality IS DISTINCT FROM OLD.modality
  THEN
    RAISE EXCEPTION 'submissions append-only: khong duoc sua noi dung bai nop sau khi insert (chi cho phep deleted_at, updated_at, confirmed_transcript)'
      USING ERRCODE = 'raise_exception';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

DROP TRIGGER IF EXISTS submissions_append_only_guard ON submissions;
--> statement-breakpoint

CREATE TRIGGER submissions_append_only_guard
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION submissions_enforce_append_only();
--> statement-breakpoint

-- ── e. CHECK mastery range trong vocabulary_vault ─────────────────────────
-- Thang mastery chốt 0–4 (MASTERY_MAX trong src/server/vocabulary/schedule.ts,
-- hiển thị "x/5"). Dữ liệu production đã validate sạch trước khi apply.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'vocabulary_vault_mastery_range_check'
      AND conrelid = 'public.vocabulary_vault'::regclass
  ) THEN
    ALTER TABLE vocabulary_vault
      ADD CONSTRAINT vocabulary_vault_mastery_range_check
      CHECK (mastery_level >= 0 AND mastery_level <= 4);
  END IF;
END $$;
