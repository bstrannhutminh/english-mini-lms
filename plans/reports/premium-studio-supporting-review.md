# Premium Studio — Progress, Settings, Admin, Login

20/11/2026. Source implementation complete; user visual acceptance pending. No DB/provider/auth calls used for browser fixtures.

## Changed source

- Progress: `progress-view`, `progress-stat-cards`, `skill-breakdown-card`, `recurring-errors-card`, `revision-comparisons-card`. Overview now one metrics strip, full-width four-skill evidence grid, flat error quotations, readable original/revised pairs below. All values remain server props; no trends or scores added.
- Settings: `settings-view`, `settings-section`, `learning-plan-card`, `account-card`. Outer nested panels removed; desktop description rail and flat content surfaces, current goal primary, account row wraps mobile. Reminder rollback, account/delete/logout controls unchanged.
- Admin: `admin-app`, `dashboard-tab`. Compact heading/divider, empty failed-assessment wording avoids claiming every submission has finished grading.
- Auth: `login-form`. Desktop editorial introduction/form split; mobile focused form, existing password/magic-link/sent/error branches preserved.

## Verification

- Scoped ESLint and `npm run typecheck`: PASS, exit 0 after final source edits.
- 50 focused existing tests: PASS across settings preferences/contract, auth login messages, recommendation/daily plan, admin content guard.
- `git diff --check` for owned source: PASS.
- Browser: actual components in isolated Next fixture at `127.0.0.1:3035`, GET contracts intercepted, local mutations intercepted HTTP503, all external requests blocked before provider. Artifacts: [supporting](premium-studio-artifacts/supporting/).
- Before: 375/1440 screenshots of Progress/Settings/Admin/Login. After: 320/375/768/1440 screenshots of all four, no document horizontal overflow on 16 samples. The settings sr-only checkbox has 1px native bounds; its wrapping label supplies the actual >=44px control target, so this is not a 1px visible target.
- Settings: reminder failed PATCH503 rolls back false→false with error toast; signout confirmation opens and Escape cancels. No signout submitted.
- Login: hydrated switch password→magic-link PASS; required password native validation PASS; error screenshot uses `initialError` fixture prop, not a real provider rejection. Password sign-in and email delivery remain not verified.
- Hash receipt confirms all 12 owned files match main source, with one explicit fixture-only normalization: hardcoded login email replaced by `minh@example.test`. Main product default email unchanged. Baseline login was privacy-retaken with original component plus synthetic email and final common palette, so its palette differs from the earliest before sample; structural comparison remains valid. All shared login screenshots now contain only synthetic email.
- Initial browser retries hit compile contention/stale HMR and missing pure vocabulary schedule dependency in the shared preview. Earlier failed interaction attempts are not product failures and are not PASS evidence. After owned preview clean restart, focused login checks passed; records retained.

## Visual critique

Viewed Progress1440, Settings1440, Login1440 and Login375/error images directly. Progress now clearly reads overview→skills→evidence; Settings rail removes nested framing while preserving functional grouping; Login has a genuine two-part desktop composition and single-focus mobile form. Warm neutral shared tokens remove competing gradients. No visual score substitutes for user approval.

## Remaining limits

No real provider/DB, native phone keyboard/Safari/screenreader, successful settings save, account deletion, email delivery, or authenticated admin production guard browser check. Guard remains covered by hermetic unit tests. Final acceptance and complete verification status are owned by the root walkthrough.

## Separate Next route typing repair

`withLearner`/`withAdmin` now return overloaded `HttpRouteHandler<TParams>`: one-argument internal call remains available; final overload requires `{params:Promise<TParams>}` for Next generated route checks. Runtime guard/params/error bodies unchanged. Generated-route typecheck PASS; 32 focused tests PASS including six new context/type tests and seven admin-guard cases. No tsconfig suppression or route-contract change.
