# Premium Today — browser QA, 20/11/2026

Status: Phase 1 verified on synthetic UI fixtures; user visual acceptance pending.

Preview: http://127.0.0.1:3034/today — isolated source copy `/private/tmp/lms-premium-today-preview`, Next16.3.6 webpack. Parent's main server3000 was not modified or stopped. Preview remains running for visual review. No secret/env copied; no DB, migration, seed or actual provider used. Synthetic default GET endpoint now supports standalone preview; start actions are verified through intercepted synthetic responses, not a live learning session.

## Source and screenshots

Before-source snapshot hashes captured before edits: [baseline manifest](premium-today-artifacts/baseline-hashes.json). All12baseline files recovered byte-identically from an earlier isolated preview and preserved at [baseline-source](premium-today-artifacts/baseline-source/src/features/today/). Final13Today source files match preview byte-for-byte: [final manifest](premium-today-artifacts/final-source-hashes.json). Global CSS is unchanged from preflight; preview only adjusts Tailwind source scanning to its isolated root. Same system font fallback before/after; network Google Inter font was not loaded. Therefore this is composition evidence, not final Inter rendering evidence.

Fresh same-content comparison at375×812,768×1024,1440×900:

- [Before375](premium-today-artifacts/before-fresh-375.png), [after375](premium-today-artifacts/after-fresh-375.png).
- [Before768](premium-today-artifacts/before-fresh-768.png), [after768](premium-today-artifacts/after-fresh-768.png).
- [Before1440](premium-today-artifacts/before-fresh-1440.png), [after1440](premium-today-artifacts/after-fresh-1440.png).

At375, primary CTA moved from y932.77–980.77 to y567–623, height48→56px, above bottom nav at732px. Final fresh CTA positions:768 y403–459,1440 y409.5–465.5. No document horizontal overflow across320/375/768/1440. [Before metrics](premium-today-artifacts/before-results.json), [final metrics](premium-today-artifacts/after-results.json).

Final screenshots for active/revision/empty/loading/error exist at `premium-today-artifacts/after-{state}-{375,1440}.png`, alongside fresh screenshots. Screenshot captures come from actual Chrome rendering, not generated images.

## Checks actually run

31/31 fixture interaction checks passed:30/45 selector and actualPOSTpayload, only onePOST perstart, native-click navigation, alternate selection/reset across duration, active/draft resume withoutPOST, revision parentId preserved on200and409, GET503retry, POST503toast/re-enable/retry, reason/timeline disclosures, baselineCTA, overflow checks. [Checks](premium-today-artifacts/qa-checks.json), [network receipts](premium-today-artifacts/qa-network.json). Existing35targeted hermetic tests also passed: recommendation10,dailyplan12,SRS/dailyplan10,focusroutes3. No main source edited by reviewer.

Accessibility final7/7checks passed:16nativeTabstops include controls andCTA;2pxfocusoutlines; CTAstart/continue settle to teal after160ms outline-color transition;40computed visible text samples passedAA with minimum5.21:1; reduced-motion matches and transition reduced;720CSSpxreflow equivalent to1440desktop at200% has no horizontal overflow. Initial immediate outline sampling produced a false failure before transition settled; final samples wait250ms. [A11y receipt](premium-today-artifacts/a11y-results.json), [focus screenshot](premium-today-artifacts/after-keyboard-focus-375.png), [reflow](premium-today-artifacts/after-reflow-200-equivalent.png).

## Critique and limits

Primary hierarchy: greeting reduced, lesson now dominates, one filledCTA; mobileCTA visible withoutscroll. Spaciousness: secondary content is below hero and no longer a competing card column. Readability: title/goal have clear size/weight separation; modebadge now16px. Mobile usability: selector/start remain44/56pxcontrols, secondary actions wrap. Consistency: mode metadata and existingnav/CTA tokens preserved. Polish: flat surfaces and restrainedteal replace competing pastels/gradients. User taste acceptance is pending, not inferred from tests.

Native device/Safari, actual browser menuzoom200%, full control-border/icon contrast audit, screenreader, actualauth/DB/provider session creation, mic/media/autosave/transcript/SRS flows are not verified. Reflow check is720CSSpx viewport, not a claim of native browserzoom. Phase2+screens not redesigned/retested here due Today visual gate.

Owned Chrome processes exit after each run and temporary profiles removed; lifecycle receipt in `premium-today-artifacts/browser-process.json`. Preview3034 deliberately retained for user visual review.
