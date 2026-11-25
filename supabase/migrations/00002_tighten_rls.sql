-- 00002_tighten_rls.sql — siết RLS sau audit bảo mật 25/11/2026
-- Idempotent: có thể chạy lại an toàn.
--
-- Nguyên tắc: MỌI ghi dữ liệu đi qua server (postgres.js/Drizzle, role postgres
-- là owner nên bypass RLS). PostgREST (anon/authenticated) chỉ được SELECT
-- phạm vi tối thiểu; KHÔNG cấp INSERT/UPDATE/DELETE ở bất kỳ bảng nào.

-- ============ A. 3 bảng nội dung: trước đây RLS TẮT hoàn toàn ============
-- Nội dung học không bí mật với chính learner, nhưng tuyệt đối không được ghi
-- từ phía client. Cho phép SELECT để không chặn các luồng đọc hợp lệ sau này.
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_segments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activities_read_authenticated" ON activities;
CREATE POLICY "activities_read_authenticated" ON activities
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "sources_read_authenticated" ON sources;
CREATE POLICY "sources_read_authenticated" ON sources
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "segments_read_authenticated" ON source_segments;
CREATE POLICY "segments_read_authenticated" ON source_segments
  FOR SELECT TO authenticated USING (true);

-- ============ B. 12 bảng learner: bỏ FOR ALL, chỉ còn SELECT phạm vi own ============
-- FOR ALL cũ cho phép UPDATE/DELETE qua PostgREST → phá invariant append-only,
-- sửa body/assisted/role được. Giờ chỉ SELECT; mọi mutation qua server.

DROP POLICY IF EXISTS "learners_own_data" ON learners;
CREATE POLICY "learners_select_own" ON learners
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_own_data" ON learning_sessions;
CREATE POLICY "sessions_select_own" ON learning_sessions
  FOR SELECT TO authenticated USING (
    learner_id IN (SELECT id FROM learners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "session_events_own_data" ON session_events;
CREATE POLICY "session_events_select_own" ON session_events
  FOR SELECT TO authenticated USING (
    learner_id IN (SELECT id FROM learners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "drafts_own_data" ON drafts;
CREATE POLICY "drafts_select_own" ON drafts
  FOR SELECT TO authenticated USING (
    learner_id IN (SELECT id FROM learners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "media_own_data" ON media_objects;
CREATE POLICY "media_select_own" ON media_objects
  FOR SELECT TO authenticated USING (
    learner_id IN (SELECT id FROM learners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "submissions_own_data" ON submissions;
CREATE POLICY "submissions_select_own" ON submissions
  FOR SELECT TO authenticated USING (
    learner_id IN (SELECT id FROM learners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "assessments_own_data" ON assessments;
CREATE POLICY "assessments_select_own" ON assessments
  FOR SELECT TO authenticated USING (
    learner_id IN (SELECT id FROM learners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "feedback_own_data" ON feedback_versions;
CREATE POLICY "feedback_select_own" ON feedback_versions
  FOR SELECT TO authenticated USING (
    learner_id IN (SELECT id FROM learners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "errors_own_data" ON error_observations;
CREATE POLICY "errors_select_own" ON error_observations
  FOR SELECT TO authenticated USING (
    learner_id IN (SELECT id FROM learners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "vocabulary_own_data" ON vocabulary_vault;
CREATE POLICY "vocabulary_select_own" ON vocabulary_vault
  FOR SELECT TO authenticated USING (
    learner_id IN (SELECT id FROM learners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "vocab_reviews_own_data" ON vocabulary_reviews;
CREATE POLICY "vocab_reviews_select_own" ON vocabulary_reviews
  FOR SELECT TO authenticated USING (
    learner_id IN (SELECT id FROM learners WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "usage_events_own_data" ON usage_events;
CREATE POLICY "usage_events_select_own" ON usage_events
  FOR SELECT TO authenticated USING (
    learner_id IN (SELECT id FROM learners WHERE user_id = auth.uid())
  );

-- Policy FOR ALL trong 00001 dùng tên khác ở 2 bảng này — xóa nốt cho sạch
DROP POLICY IF EXISTS "usage_own_data" ON usage_events;
DROP POLICY IF EXISTS "vocab_own_data" ON vocabulary_vault;
