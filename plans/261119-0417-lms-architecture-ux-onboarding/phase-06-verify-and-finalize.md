---
title: "Phase 6: Tests, Review, Docs & Finalize"
status: completed
---

# Phase 6: Tests, Review, Docs & Finalize

## Overview

Add hermetic unit tests for all new/redesigned modules, run conditional simplification, execute fresh-context `tester` and `code-reviewer` subagents, perform full plan sync-back, update affected docs via `docs-manager`, commit locally via `git-manager`, and record a technical journal entry.

## Requirements

- [x] Add hermetic unit tests for: Focus Mode route detection, Onboarding presets/summary/first-run helper, updated `pick-activity` plain-Vietnamese reasons & priority tie-breaking, persistent timer storage helper, and Library filtering logic.
- [x] Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` cleanly without `.env.local`.
- [x] Evaluate Conditional Simplify (`code-simplifier`) against live diff thresholds.
- [x] Invoke fresh-context `tester` subagent (100% pass required).
- [x] Invoke fresh-context `code-reviewer` subagent with mandatory checks (a)–(e) and auto-fix any critical issues.
- [x] Sync back all plan phases (`phase-01`..`phase-06`) and `plan.md`, check docs impact via `docs-manager`, commit locally via `git-manager` (do NOT push to `master`), and write concise journal entry.

## Implementation Steps

### Kiểm tra tiếp nối ngày 19/11/2026

Review độc lập phát hiện các điểm phải sửa trước nghiệm thu: lỗi bỏ qua onboarding không được che bằng chuyển trang; chỉ thoát khi lưu nháp thành công; khôi phục timer an toàn trong Strict Mode và đếm theo deadline; `/offline` phải public; mục tiêu số từ phải bám đề; gợi ý dùng hồ sơ khi số bài ngang nhau; Markdown phải giữ đoạn ngay sau heading. Kiểm tra thêm kích thước nút và trường nhập ở các phần đã đổi. Bằng chứng browser với DB tạm phải tách khỏi Supabase/Gemini và điện thoại thật.

1. Write hermetic unit tests under `tests/unit/` for all new helpers and updated behavior.
2. Run `npm run lint && npm run typecheck && npm test && npm run build`.
3. Compute live diff stats and invoke `code-simplifier` if thresholds are breached.
4. Invoke `tester` subagent to verify all unit tests and build cleanly.
5. Invoke `code-reviewer` subagent with scout summary + acceptance criteria + mandatory (a)–(e) checks.
6. Run `ak plan` sync-back across all phases, invoke `docs-manager` for affected docs, commit locally via `git-manager`, and create a journal with `ak journal create` in the configured plan storage; link it from the handoff report.

## Bàn giao local ngày 19/11/2026

Checkpoint source `06a3cd3`. [Báo cáo bàn giao](../reports/pm-261119-1203-lms-redesign.md) liên kết tester, reviewer, browser, docs, tách module và nhật ký. 42 file/358 test qua; build Turbopack mặc định qua. Browser dùng DB tạm/nguồn approved ở 390px và 1280px, có kiểm tra timer, lỗi lưu/nộp và offline lần đầu. Điện thoại và dịch vụ thật là nghiệm thu riêng; không push hoặc deploy.

## Todo

- [x] Write & pass hermetic unit tests for all redesigned modules
- [x] Run full lint, typecheck, unit tests, and build without `.env.local`
- [x] Run Conditional Simplify check
- [x] Complete fresh-context `tester` verification
- [x] Complete fresh-context `code-reviewer` cycle
- [x] Sync plan files, update affected docs, commit locally, write journal

## Success Criteria

100% unit tests passing, lint/typecheck/build green without `.env.local`, code review auto-approved with 0 critical issues, all plan checkboxes synced, and clean local commit on `feat/lms-architecture-ux-onboarding`.
