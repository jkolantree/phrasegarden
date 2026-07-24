# Public Preview candidate work package

## Objective

Produce one usable, locally verified PhraseGarden `0.1.0-preview.1` publication
candidate and stop before any repository or deployment write.

## Source of truth

- User's attached public-Preview implementation contract
- `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/RECIPE-SCHEMA.md`
- `docs/DESIGN-CONTRACT.md` — Woven Conversation
- `docs/EVALUATION.md`, `docs/DECISIONS.md`
- Existing development/regression fixtures and provenance ledger

## In scope

- Preview support correction
- Authored catalog, recipes, deterministic compiler, snapshots
- Memory-only home, builder, and review interface
- Copy, local edit, regeneration, and download
- Playwright, axe, responsive, privacy/network, and production-byte checks
- Public documentation, samples, Pages workflow, local bundle, checksums

## Out of scope

- Community/Reviewed/Flagship resolution or review governance
- Model evaluation or prospective-fixture consumption
- Persistence, sharing, service worker, accounts, telemetry, backend, runtime AI
- Repository initialization, license selection, remote writes, publication,
  Pages enablement, or deployment

## Acceptance

- Exact EN↔JA directions resolve Preview; all other directions resolve Generic.
- Generic output has no endpoint/profile/pair linguistic clauses.
- Canonical prompts are deterministic UTF-8/LF text with exact provenance.
- A first-time user can select, configure, summarize, generate, inspect, copy,
  edit, regenerate, and download at desktop and narrow widths.
- Full unit, snapshot, type, build, domain, browser/accessibility, network, and
  release-byte checks pass.
- Documentation and the UI state external-review and accessibility limits
  without overclaiming.

## Verification

```text
pnpm test
pnpm typecheck
pnpm build
pnpm audit:release
pnpm test:e2e
rg forbidden browser/network/storage/clock/randomness APIs in src/domain
```

Inspect the four rendered screenshots and the exact release-bundle hash.

## Stop conditions

Stop on a contradictory identity, tier, or Generic-isolation requirement; an
unexpected baseline failure; inability to preserve existing validators; a
required privacy or architecture expansion; or any external publication action.

## Handoff

Completed locally on 2026-07-23:

- 19/19 focused compiler tests and 270/270 full unit/snapshot tests passed.
- Both TypeScript configurations, the Vite build, release audit, and
  zero-match forbidden-domain scan passed.
- 4/4 sequential Microsoft Edge Playwright/axe journeys passed, including
  keyboard-only, exact copy/download, network isolation, 320 px, bidi,
  reduced-motion, 200%, and 400%-equivalent checks.
- Four current screenshots were inspected with no visible clipping, overlap,
  or stray skip-link artifact.
- `release/phrasegarden-0.1.0-preview.1-pages.zip` is 40,963 bytes with
  SHA-256
  `A9952F91DF731D6C4D3785DBFB24513D6477B571F659E3A3C1EB5E65F5618357`.
- All 7/7 `SHA256SUMS` entries and 3/3 archive files matched their recorded
  bytes.
- `docs/PROJECT-STATE.md` records limitations and blocked, deferred, unchanged,
  and skipped work.

Stop at the authorization boundary. Request one explicit publication decision;
do not initialize Git, add licenses, create a repository, push, release, enable
Pages, or deploy before approval.
