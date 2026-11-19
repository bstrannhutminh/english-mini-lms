---
title: "Phase 3: Today Hub & Learning Loop Redesign"
status: completed
---

# Phase 3: Today Hub & Learning Loop Redesign

## Overview

Transform `/today` from a crowded 6-card stack with technical jargon into a calm, uncluttered **Learning-First Hub** where BS. Minh sees exactly what to do next in ≤2 taps.

## Requirements

- [x] Remove raw technical jargon (`Quy tắc (a):`, `Quy tắc (c):`, `Quy tắc (d):`) from `pick-activity.ts` while preserving deterministic rule-based explanations in plain Vietnamese.
- [x] Enhance `pickRecommendedActivity` with optional learner priority/self-assessment tie-breaking when skills have equal recent counts (still pure & hermetic).
- [x] Redesign `TodayHero`: light/calm clinical header with time-of-day greeting, inline 30'/45' switcher, streak badge ONLY when > 0.
- [x] Redesign `SessionPlan`: compact horizontal stepper on desktop / sleek progress strip on mobile so it visualizes the 4-step loop without duplicating the primary CTA card.
- [x] Unify primary focus above the fold: `ContinueBlock` (when session in progress) + single crisp `RecommendedCard` with plain-Vietnamese reason, swap drawer, and 1-tap start.
- [x] Replace misleading purple "khảo sát 15 phút" `BaselineBanner` with a calm 2-minute onboarding setup reminder (only shown when onboarding was skipped).
- [x] Remove redundant bottom `QuickLinks` card (already in persistent navigation).

## Implementation Steps

1. Update `src/server/today/pick-activity.ts` & `src/server/today/service.ts` to emit clean Vietnamese reasons and use learner self-assessment/priorities as tie-breaker.
2. Redesign `src/features/today/today-hero.tsx`, `start-controls.tsx`, `session-plan.tsx`, `continue-block.tsx`, `recommended-card.tsx`, `baseline-banner.tsx`, `due-vocab-teaser.tsx`, and `today-view.tsx`.
3. Verify all Today components stay ≤200 lines, use SVG icons, and keep `data-tour` hooks intact.

## Todo

- [x] Humanize `pick-activity.ts` reasons + priority tie-breaker
- [x] Redesign `TodayHero` & `StartControls` (calm clinical header + time-of-day greeting)
- [x] Streamline `SessionPlan` into compact 4-step daily loop strip
- [x] Polish `ContinueBlock`, `RecommendedCard`, `BaselineBanner`, `DueVocabTeaser`, and `TodayView`

## Success Criteria

`/today` has zero technical rule labels, 1 clear primary CTA above the fold, compact visual loop progress, and honors the learner's configured 30'/45' default.
