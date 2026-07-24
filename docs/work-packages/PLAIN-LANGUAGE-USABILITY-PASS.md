# Plain-language usability pass

## Objective

Make the existing Home → Builder → Review journey understandable to a
first-time, nontechnical visitor without changing what PhraseGarden compiles or
what its support labels mean.

## Source of truth

- `docs/PRODUCT.md`
- `docs/DESIGN-CONTRACT.md` — Woven Conversation
- `docs/ACCESSIBILITY.md`
- Current published Home, Builder, and Review screenshots captured on
  2026-07-23
- Existing compiler, summary, privacy, keyboard, and browser regression tests

## In scope

- Plain-language page headings, explanations, field labels, option labels,
  support descriptions, summaries, notices, actions, and announcements
- A clearer three-step task progression
- Review-page hierarchy that leads from summary to cautions to prompt actions
- Moving raw limitation codes and build vocabulary out of the primary journey
  and into technical disclosure
- The minimum design-contract corrections needed to keep privacy and summary
  wording truthful
- Focused regression updates and current screenshots

## Out of scope

- Domain types, compiler composition, prompt instructions, recipes, profiles,
  pair guidance, support-tier resolution, or provenance structure
- New languages, Japanese interface, persistence, sharing, offline support, or
  Interpreter
- Review-evidence claims, linguistic evaluation, model evaluation, or
  prospective fixtures
- A new visual direction, new artwork, deployment, release, or remote writes

## Acceptance

- The first screen explains in plain language what a prompt is, what
  PhraseGarden makes, where to use it, and that source text is never entered.
- `Preview` and `Generic` remain exact visible support labels with simpler,
  equally cautious explanations.
- Primary screens do not require users to understand `compiler`,
  `canonicality`, `provenance`, `endpoint`, `pair pack`, `evidence`, or
  `byte budget`.
- Every exposed enum value has an intentional user-facing label.
- Summary wording preserves every semantic distinction, message ID, order, and
  value binding; its catalog version increases.
- Limitations remain visible in plain language. Exact codes and hashes remain
  available in the technical disclosure.
- Generated prompt bytes, compiler provenance, copy/download identity,
  keyboard order, IME handling, network isolation, and privacy behavior do not
  change.
- Home, Builder, and Review remain usable at 320 px, 200%, and 400%-equivalent
  reflow with no new axe violations.

## Verification

```text
pnpm test
pnpm typecheck
pnpm typecheck:domain
pnpm build
pnpm audit:release
pnpm test:e2e
rg forbidden browser/network/storage/clock/randomness APIs in src/domain
```

Compare current desktop Home, Builder, and Review screenshots plus the 320 px
Review screenshot against the captured before-state. Inspect text wrapping,
task order, focus, support explanations, and the prompt actions.

## Stop conditions

Stop on a requirement to change compiler meaning, generated prompt bytes,
support-tier derivation, language identity, privacy architecture, or the
selected visual direction; on an unexpected baseline failure; or before any
remote publication action.

## Handoff

Completed locally on 2026-07-23.

- Changed the Home, Builder, and Review interface copy and hierarchy in
  `src/app/App.tsx`, `src/ui/BehaviorSummary.tsx`, and
  `src/ui/SupportStatus.tsx`.
- Reworded the English summary catalog without changing message IDs, order,
  group bindings, or compiler output; version increased to `en@1.1.0`.
- Added explicit interface labels for every exposed enum and regression
  coverage in `tests/app/ui-copy.test.ts`.
- Kept exact limitation codes, versions, hashes, and provenance in the
  technical disclosure while presenting limitations in plain language.
- Added a regression assertion that Generic Written generation omits the
  caution section when no user-facing notices remain.
- Focused tests passed 20/20; the full suite passed 271/271; both TypeScript
  configurations, the Vite build, release audit, forbidden-domain scan, and
  `git diff --check` passed.
- Four sequential Microsoft Edge Playwright/axe journeys passed, covering
  keyboard operation, exact copy/download bytes, IME events, runtime-network
  isolation, bidi, reduced motion, 320 px, 200%, and 400%-equivalent reflow.
- Current Home, Builder, desktop Review, and 320 px Review screenshots were
  inspected after the final fixes with no clipping, overlap, stale copy, or
  hierarchy regression found.
- Independent read-only current-byte review verdict: PASS with no open
  P1/P2/P3 findings.
- The in-app Browser could not navigate to the local preview because of its
  local-URL policy. Automated Edge inspection and direct screenshot inspection
  passed; an in-app manual browser pass is not claimed.
- The public `0.1.0-preview.1` site is unchanged. No commit, push, release, or
  deployment occurred.

The next eligible package is a separately authorized versioned Preview update
covering manifests, release artifacts, checksums, and Pages bytes.
