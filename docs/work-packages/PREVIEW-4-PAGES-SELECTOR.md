# Preview 4 Pages selector

Status: completed local package awaiting exact checkpoint; completion closure separately rebound | Base: `3fc477d86e66dbfcf3485b71beccfcadfb9a7291` | Updated: 2026-08-18

## Objective

Make the existing main-only, no-build Pages workflow select only the pinned Preview 4 verifier and exact Preview 4 archive/manifest while monitoring immutable Preview 3 predecessor inputs.

## Source of truth

Closed `ReleaseSpec`s and adapters at base; ADR-032/035/036; `PREVIEW-3-PAGES-POLICY.md`; `PREVIEW-4-ARCHIVE-VERIFIER.md`; unchanged official action commits recorded 2026-08-17; `RELEASE-WORKFLOW.md` authority boundaries.

## In scope

Exactly seven paths: `.github/workflows/pages.yml`, `tests/release/release-audit.test.ts`, `docs/DECISIONS.md`, `docs/PROJECT-STATE.md`, `docs/TRACEABILITY.md`, `docs/work-packages/PREVIEW-4-ARCHIVE-VERIFIER.md`, and this contract.

## Out of scope

Verifier/audit/packager implementation, `package.json`, product or public wording, source freeze, Vite/product build, browser execution, real or qualified release-artifact/evidence creation, ledger/package, network, push, dispatch, deployment, Gate 4+, and Preview 3 mutation.

## Acceptance

| ID | Observable evidence |
|---|---|
| `P4-PS-01` | Extraction invokes `python3 scripts/preview4-verify-release-archive.py` exactly once with exact Preview 4 ZIP, manifest, `SHA256SUMS`, `dist`, and `--require-packaging-commit`; no generic/P3/core invocation or release selector exists. |
| `P4-PS-02` | Exactly two audits receive only the same Preview 4 manifest; extraction → audit → browser → audit → upload order and deploy-needs-verify remain exact. |
| `P4-PS-03` | The complete run-command allowlist, exact root-script key allowlist, and invoked script values contain tests/typecheck/verifier test/extraction/audits/browser only; no lifecycle hook, build, freeze, stage, promote, package, or alternate output exists. |
| `P4-PS-04` | Five immutable action SHAs, two main guards, empty global permissions, least-privilege jobs, full non-partial history, disabled credential persistence, and concurrency are exact. Full history is required because the permanent verifier differential reads checkpoint `c245244400858d759176b4d0679c343b700a5fde`; the packaging verifier still rejects partial/promisor object state. |
| `P4-PS-05` | Push paths contain the exact active Preview 4 ZIP/manifest and immutable Preview 3 predecessor ZIP/manifest; P3 occurs nowhere in active commands. |
| `P4-PS-06` | A normalized exact-workflow hash plus permanent mutations fail closed on crossed/stale identities, selector injection, extra or unparsed commands, skipped/ignored audit, alternate checkout, missing lineage trigger, weakened authority, changed concurrency/trigger/order/upload, mutable action reference, or added root lifecycle hook. |
| `P4-PS-07` | The exact base/verifier checkpoint is `3fc477d86e66dbfcf3485b71beccfcadfb9a7291`; the selector checkpoint must precede source freeze and cannot be pushed/dispatched alone. |
| `P4-PS-08` | Focused/full deterministic tests, both typechecks, protected-path/cache/diff/scope/accounting checks, and independent frozen-byte review pass without claiming workflow execution, publication, deployment, or readiness. |

## Verification

Run focused `release-audit.test.ts`, full Vitest, focused/all Python release tests, both TypeScript configurations, workflow static probes, protected-path/cache/scope/net/diff checks, then independent exact-byte review. Deliberately skip Vite/product build, browser and workflow execution, real or qualified release-artifact generation/extraction, network, push, and deployment because no qualified Preview 4 artifact exists and no product/release bytes change. Python tests may create and extract temporary synthetic development fixtures.

## Stop conditions

Stop on crossed identity, absent P3 lineage trigger, widened permission/trigger, mutable pin, build/regeneration, verifier/audit/package/product/artifact drift, public claim, unrelated baseline failure, dirty scope, or net `>=350` lines; target `<250`.

## Handoff

Record exact paths/hashes/net size, tests, protected hashes, review verdict, skips, limits, and next source-identity package. Checkpoint only these seven paths; do not freeze, package, push, dispatch, deploy, or publish.
