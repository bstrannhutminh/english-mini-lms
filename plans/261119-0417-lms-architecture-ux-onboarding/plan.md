---
title: "LMS Architecture, Learning Experience, UI/UX & Onboarding Redesign"
description: "Integrate the learning-first modular architecture and comprehensively redesign the learning loop, Focus Mode, all 4 skill panels, Today hub, Library discovery, cross-page UI/UX, PWA setup, and first-run 4-step Onboarding wizard."
status: completed
priority: P1
effort: "L"
tags: [architecture, ui-ux, onboarding, learning-loop, pwa]
created: 2026-11-19
---

# LMS Architecture, Learning Experience, UI/UX & Onboarding Redesign

## Overview

Redesign and unify the English Mini LMS around a calm, doctor-friendly **Medical Clean (Teal + Slate)** learning experience:

1. Bring the verified modular architecture (`src/contracts`, `src/server/http`, `src/components/{ui,layout}`, `src/features/*`, `SessionShell` + 4 mode plugins, hermetic unit test split) into branch `feat/lms-architecture-ux-onboarding` while preserving `master` untouched for Vercel production.
2. Introduce a distraction-free **4-step Guided Initial Onboarding Wizard** (`/onboarding`) with gentle first-run auto-entry, 1-tap skip, personalized study-loop preview, and re-entry from Profile/Settings.
3. Eliminate Today hub clutter & technical jargon (`Quy tắc (c):`), unify the primary CTA, and read the learner's real `targetMinutesDefault`.
4. Deliver true **Focus Mode** inside `/learn/[sessionId]` and `/onboarding` (hiding bottom/top nav), fix ActionBar overlap & blue color clashes, add persistent session timer across app switches, and elevate all 4 learning modes (Writing, Reading-Translation, Speaking, Listening/Shadowing).
5. Upgrade `/library` to instant discovery (Topic strip + Search + Skill/Status filters + Activity Grid) and polish `/vocab`, `/my-work`, `/progress`, `/settings`, `/admin`, `/login`, and PWA (`/offline` + PNG icons + pinch-zoom).

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Clean modular architecture foundation + working PWA/offline/viewport | P1 |
| 2 | Guided 4-step Initial Onboarding Wizard with auto-entry & 1-tap skip | P1 |
| 3 | Streamlined Today hub (≤2 taps, zero jargon, unified CTA, real default minutes) | P1 |
| 4 | Focus Mode SessionShell + elevated UX/content display for all 4 learning modes | P1 |
| 5 | Instant-discovery Library + cohesive Medical Clean UI/UX across all pages | P1 |
| 6 | 100% green hermetic tests, lint, typecheck, build, independent review & sync-back | P1 |

## Phases

| # | Phase |
|---|-------|
| 1 | [Phase 1: Foundation Merge, Focus Shell & PWA](./phase-01-foundation-and-pwa.md) |
| 2 | [Phase 2: Guided 4-Step Onboarding Wizard](./phase-02-onboarding-wizard.md) |
| 3 | [Phase 3: Today Hub & Learning Loop Redesign](./phase-03-today-hub-redesign.md) |
| 4 | [Phase 4: Focus Learning Workspace & 4 Skill Modes](./phase-04-session-and-modes.md) |
| 5 | [Phase 5: Library Discovery & Cross-Page UI/UX Polish](./phase-05-library-and-pages.md) |
| 6 | [Phase 6: Tests, Review, Docs & Finalize](./phase-06-verify-and-finalize.md) |

## Bàn giao đã kiểm tra

Checkpoint source `06a3cd3`; bằng chứng và giới hạn tại [báo cáo bàn giao](../reports/pm-261119-1203-lms-redesign.md). Trạng thái phase được suy ra từ checklist bởi `ak plan status`; bảng phase giữ vai trò điều hướng. Nghiệm thu điện thoại/Supabase/Gemini thật chưa thuộc bằng chứng local này. Không có push, merge master hoặc deploy.

## Success Criteria

- [x] `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` all pass cleanly without `.env.local`.
- [x] All non-negotiable invariants remain protected by passing unit tests (append-only submissions, server-side `assisted`, speaking text-only `not_assessable`, no official IELTS band, IELTS skill routing, locked listening transcript).
- [x] First-time learner gets guided 4-step Onboarding (skippable in 1 tap); returning learner can edit anytime from Profile/Settings.
- [x] Focus Mode hides navigation bars in `/learn/*` and `/onboarding`; ActionBar never overlaps content; timer persists across visibility switches.
- [x] Every page uses cohesive Medical Clean Teal/Slate tokens, ≥16px inputs, ≥44px touch targets, 0 `alert()`/`confirm()`, and readable Markdown content display.
- [x] Fresh-context `tester`, `code-reviewer`, `docs-manager`, and `git-manager` complete cleanly on `feat/lms-architecture-ux-onboarding` without touching `master`.

<!-- slug: lms-architecture-ux-onboarding -->
