---
title: "Phase 1: Foundation Merge, Focus Shell & PWA"
status: completed
---

# Phase 1: Foundation Merge, Focus Shell & PWA

## Overview

Integrate the modular architecture from `refactor/learning-first-2026-10-19` into `feat/lms-architecture-ux-onboarding` (preserving `master` docs), add true Focus Mode layout routing for `/learn/*` and `/onboarding`, fix PWA icons/manifest/viewport/offline fallback, and unify Tour colors to Teal.

## Requirements

- [x] Merge `refactor/learning-first-2026-10-19` cleanly without losing `master` docs (`docs/huong-dan-lms-2026-10-14.md`, `docs/plan/kien-truc-tai-cau-truc-2026-10-19.md`, `docs/plan/huong-dan-toi-uu-ui-ux-2026-10-10.md`, `.agents/workflows/fix-step.md`).
- [x] Add `MainShell` + `isFocusRoute()` so `/learn/*` and `/onboarding` render in distraction-free Focus Mode without sidebar, mobile top bar, or bottom tab bar.
- [x] Fix PWA: generate PNG icons (`icon-192.png`, `icon-512.png`, `apple-touch-icon.png`), update `manifest.json` (`theme_color: #0d9488`, `background_color: #f8fafc`, shortcuts), remove `userScalable: false`/`maximumScale: 1` from `src/app/layout.tsx`, add `/offline` page + `sw.js` navigation fallback.
- [x] Align `TourTooltip` accents to Teal and suppress auto-tour on Focus Routes.

## Implementation Steps

1. Merge `refactor/learning-first-2026-10-19` into `feat/lms-architecture-ux-onboarding` and resolve doc overlaps cleanly.
2. Run baseline `npm run typecheck && npm test` to verify green start.
3. Generate Teal brand PNG icons under `public/icons/` and update `public/manifest.json`, `public/sw.js`, `src/app/layout.tsx`, and create `src/app/offline/page.tsx`.
4. Add `src/components/layout/focus-routes.ts` and `src/components/layout/main-shell.tsx`, wire into `src/app/(main)/layout.tsx`.
5. Update `src/components/tour-tooltip.tsx` and `src/components/tour-host.tsx` for Teal styling and Focus Route awareness.

## Todo

- [x] Merge `refactor/learning-first-2026-10-19` cleanly
- [x] Create PNG PWA icons, update `manifest.json`, `sw.js`, `layout.tsx`, and `/offline` page
- [x] Implement Focus Mode shell (`focus-routes.ts`, `main-shell.tsx`, `(main)/layout.tsx`)
- [x] Align `TourTooltip` & `TourHost` to Teal + Focus Mode suppression

## Success Criteria

`npm run typecheck`, `npm test`, and `npm run build` pass; Focus Mode hides nav on `/learn/*` and `/onboarding`; PWA manifest points to real PNG icons with Teal theme and pinch-zoom enabled.
