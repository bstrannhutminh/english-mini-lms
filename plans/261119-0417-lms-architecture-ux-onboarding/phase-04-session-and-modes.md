---
title: "Phase 4: Focus Learning Workspace & 4 Skill Modes"
status: completed
---

# Phase 4: Focus Learning Workspace & 4 Skill Modes

## Overview

Upgrade `SessionShell` and all 4 skill mode plugins (Writing, Reading-Translation, Speaking, Listening & Shadowing) for distraction-free studying, crisp content display, zero ActionBar overlap, persistent timers, and cohesive Teal design tokens.

## Requirements

- [x] Persist study timer per `sessionId` in `sessionStorage` + sync elapsed time on `visibilitychange` (protects sessions across phone interruptions).
- [x] Upgrade `ShellHeader`: clean Focus Mode top bar with exit `ConfirmDialog` ("Nháp đã lưu — tạm dừng phiên học?"), SVG icons, save indicator, and 44px+ timer toggle.
- [x] Fix `ActionBar`: sticky `bottom-0` (no overlap with content, generous scroll padding in `SessionShell`), Teal primary button (`bg-primary`), SVG icons (zero `🚀`/`💾`/`⌨️` emojis).
- [x] Reading Mode: render `segment.textContent` with `MarkdownText` (fixing raw `#` headings), add font-size control (`A-` / `A` / `A+`), step progress cues on the 3 input cards, and calm Quick-Capture tip.
- [x] Writing Mode: add live word-count progress bar against recommended target (e.g. 120–150 words) + Teal focus ring + clean revision reference.
- [x] Speaking Mode: add 3-step speaking cue bar (`Chuẩn bị` → `Ghi âm` → `Nghe lại & Nộp`), calm medical-grade recorder studio UI with pulsing live indicator and clear `not_assessable` note for text-only submissions.
- [x] Listening & Shadowing Mode: add 3-stage progression indicator (`1. Nghe & Trả lời` → `2. Đáp án & Transcript` → `3. Shadowing`), unify YouTube player controls to Teal/Slate, crisp locked-transcript card, SVG icons.

## Implementation Steps

1. Update `src/features/session/hooks/use-session-timer.ts` with `sessionStorage` persistence + `visibilitychange` sync.
2. Refactor `shell-header.tsx`, `hint-bar.tsx`, `action-bar.tsx`, `session-shell.tsx` for Focus Mode spacing, exit `ConfirmDialog`, Teal buttons, and SVG icons.
3. Upgrade Reading (`passage-card.tsx`, `reading-panel.tsx`) with `MarkdownText`, font-size toggle, and step status indicators.
4. Upgrade Writing (`writing-panel.tsx`) with word-count progress bar and Teal styling.
5. Upgrade Speaking (`speaking-panel.tsx`, `speaking-recorder.tsx`, `audio-recorder.tsx`) with 3-step studio flow and calmer recording controls.
6. Upgrade Listening (`listening-panel.tsx`, `youtube-player.tsx`, `listening-transcript-card.tsx`, `listening-questions-card.tsx`) with 3-stage pills and Teal controls.

## Todo

- [x] Persistent `useSessionTimer` (sessionStorage + visibilitychange)
- [x] Focus Mode `SessionShell`, `ShellHeader` (ConfirmDialog exit), `HintBar`, `ActionBar` (Teal, no overlap)
- [x] Reading Mode (`MarkdownText` passage + `A-/A/A+` font-size + 3-step indicators)
- [x] Writing Mode (word-count progress bar + Teal focus styling)
- [x] Speaking Mode (3-step cue + refined calm audio studio UI)
- [x] Listening & Shadowing Mode (3-stage progress + Teal media controls)

## Success Criteria

All 4 modes + `ielts-*` variants render cleanly at 390px and 1280px with zero bottom-bar overlap, Markdown-formatted passages, Teal controls, persistent timers, and every learning invariant preserved.
