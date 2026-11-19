---
title: "Phase 5: Library Discovery & Cross-Page UI/UX Polish"
status: completed
---

# Phase 5: Library Discovery & Cross-Page UI/UX Polish

## Overview

Eliminate the extra click-wall in `/library` with instant topic + search + skill + status filtering, and bring consistent Medical Clean UI/UX, SVG icons, and effortless setup across `/vocab`, `/my-work`, `/progress`, `/settings`, `/admin`, and `/login`.

## Requirements

- [x] Redesign `/library`: show compact Topic filter cards (with SVG icons instead of OS emojis `🎤`/`📚`/`🩺` + progress bars) AND an instant filterable Activity Grid (search, skill filter including IELTS, learning status filter) right on `/library`, while preserving `?topic=` deep links and `/library/[id]`.
- [x] Polish `/library/[id]` (`activity-detail.tsx`) with clear mode instructions & start controls.
- [x] Polish `/vocab` (`vocab-list.tsx`, `due-today-card.tsx`, `vocab-item-card.tsx`): add instant phrase/meaning search, calm action button hierarchy, and 5-dot mastery display (`x/5`).
- [x] Audit & polish `/my-work` & `/my-work/[submissionId]`: verify IELTS badge accuracy, crisp Top-3 priority feedback, responsive compare view, zero raw emoji buttons.
- [x] Polish `/progress` (`progress-stat-cards.tsx`, `skill-breakdown-card.tsx`): unify stat card palette to calm Medical Clean Teal/Slate/Emerald, add direct practice links, preserve honest "Chưa đủ bằng chứng" banner.
- [x] Polish `/settings`, `/admin`, and `/login`: add "Hồ sơ & Lộ trình học" card in `/settings` linking to `/onboarding`, replace OS emojis in `/admin` topic table & `/settings` logout button with crisp SVG icons, verify ≥16px inputs everywhere.

## Implementation Steps

1. Add clean SVG icon mapping for topics in `src/lib/topics.ts` (keeping existing `icon` string backwards-compatible while adding `iconName: IconName`).
2. Add pure library filtering helper `src/features/library/filter-activities.ts` and build `library-explorer.tsx`, updating `src/app/(main)/library/page.tsx`, `topic-grid.tsx`, `activity-card.tsx`, and `activity-detail.tsx`.
3. Polish `src/features/vocab/` (add search input + calm CTA hierarchy + 5-dot mastery bar).
4. Audit & polish `src/features/my-work/` and `src/features/progress/`.
5. Add onboarding profile card to `src/features/settings/`, polish `src/features/admin/` and `src/features/auth/`.

## Todo

- [x] Add SVG icon names to `src/lib/topics.ts`
- [x] Redesign `/library` with instant Topic strip + Search + Skill/Status filters + Activity Grid
- [x] Polish `/vocab` search, calm CTA hierarchy, and 5-dot mastery indicator
- [x] Audit & polish `/my-work` and `/progress` palette & actionable links
- [x] Polish `/settings` (Onboarding card), `/admin` (SVG topic icons), and `/login`

## Success Criteria

Every route in the LMS shares a single calm Medical Clean design language, `/library` shows filterable lessons immediately, `/settings` provides 1-tap access to Onboarding, and 0 OS emojis remain as functional chrome icons.
