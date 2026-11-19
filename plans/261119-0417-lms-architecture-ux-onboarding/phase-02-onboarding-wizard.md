---
title: "Phase 2: Guided 4-Step Onboarding Wizard"
status: completed
---

# Phase 2: Guided 4-Step Onboarding Wizard

## Overview

Design and build an effortless, distraction-free **4-step Guided Initial Onboarding Wizard** (`/onboarding`) with gentle first-run auto-entry from `/today`, 1-tap skip persistence, live preview of the personalized learning loop & Week-1 plan, and easy re-access from Profile/Settings.

## Requirements

- [x] Additive JSONB onboarding state in `learners.preferences` (`onboardingSkipped`, `onboardingCompletedAt`, `tourCompleted`) — zero DB migrations.
- [x] Support skipping onboarding cleanly (`POST /api/v1/onboarding` with `{ action: "skip" }` or `PATCH /api/v1/settings/preferences` with `{ onboardingSkipped: true }`).
- [x] First-time learners visiting `/today` (when `baselineStatus !== "completed"` and `!preferences.onboardingSkipped`) redirect smoothly to `/onboarding` (with 1-tap skip to `/today`).
- [x] 4 interactive steps with ≥16px inputs, ≥44px touch targets, Teal Medical Clean palette, and zero raw emoji buttons:
  - Step 1: Chào mừng, Mục tiêu ưu tiên (selectable cards) & Chuyên môn (quick presets + text)
  - Step 2: Nhịp học (30'/45' cards), Khung giờ (presets + time picker), Tài liệu đang đọc & IELTS (optional)
  - Step 3: Tự đánh giá nhanh 4 kỹ năng (Nghe/Nói/Đọc/Viết 1–5 with clear Vietnamese level labels, non-band disclaimer)
  - Step 4: Xem trước Lộ trình cá nhân + Chu trình học 4 bước mỗi ngày + Khởi đầu tuần 1 → Save & Launch
- [x] Update `UserMenu` and `SettingsView` with direct entry to re-run/edit Onboarding.

## Implementation Steps

1. Extend `src/contracts/onboarding.ts`, `src/contracts/settings.ts`, `src/server/onboarding/service.ts`, and `src/app/api/v1/onboarding/route.ts` to support skip & completion metadata cleanly.
2. Create `src/features/onboarding/onboarding-presets.ts` (pure presets + `buildOnboardingSummary()` + `needsFirstRunOnboarding()`).
3. Build modular step components (`step-goals.tsx`, `step-schedule.tsx`, `step-skills.tsx`, `step-preview.tsx`) and `onboarding-wizard.tsx` (each ≤200 lines).
4. Wire `src/app/(main)/onboarding/page.tsx` and update `src/app/(main)/today/page.tsx` to read saved `targetMinutesDefault` and trigger gentle first-run redirect.
5. Update `UserMenu` label to "Thiết lập lộ trình" (`/onboarding`).

## Todo

- [x] Extend onboarding contracts, service & route (skip + completion flags)
- [x] Create `onboarding-presets.ts` with pure summary & first-run helpers
- [x] Build 4-step modular Onboarding Wizard UI components
- [x] Wire first-run auto-entry & saved `targetMinutesDefault` in `/today/page.tsx`
- [x] Update `UserMenu` for easy re-entry to Onboarding

## Success Criteria

New learner lands in 4-step Onboarding, can finish in <90s or skip in 1 tap, sees personalized daily loop preview, saves cleanly into `learners.goals`/`preferences`, and `/today` honors saved `targetMinutesDefault`.
