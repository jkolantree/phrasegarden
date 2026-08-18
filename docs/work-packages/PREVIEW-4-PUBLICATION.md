# Preview 4 source identity and publication boundary

Status: substantive PASS; checkpoint conditional on exact-hash administrative PASS | Base: `93e74f508cad465d0b1652c2ca4478fd62424fb8` | Updated: 2026-08-18

## Objective

Advance the exact source and target-release identity to `0.1.0-preview.4` without changing product, prompt, language, tier, privacy, or runtime behavior, then leave source freeze, release packaging, and every public action as separate evidence boundaries.

## Source of truth

Closed Preview 4 `ReleaseSpec`; checkpoints `3a2cfd0`, `c245244`, `3fc477d`, and `93e74f5`; Preview 3 public asset and failed-Pages evidence; Preview 2 qualified Pages rollback; ADR-033–ADR-037; `RELEASE-WORKFLOW.md`.

## In scope

Exactly thirteen paths:

```text
package.json
README.md
docs/ACCESSIBILITY.md
docs/LIMITATIONS.md
docs/PRIVACY.md
docs/PRODUCT.md
docs/PROJECT-STATE.md
docs/PUBLICATION-MANIFEST.md
docs/RELEASE-NOTES.md
docs/RELEASE-WORKFLOW.md
docs/TRACEABILITY.md
docs/work-packages/PREVIEW-4-PUBLICATION.md
tests/release/release-audit.test.ts
```

## Out of scope

Product/UI/compiler/recipe/profile/pack/registry/prompt behavior; lockfile or tooling changes; real source manifest, release evidence, archive, manifest, ledger append, tag, push, release, Pages run, deployment, public-byte verification, tier promotion, linguistic review, Gate 4+, or reuse of development build bytes as the later release build.

## Acceptance

| ID | Observable evidence |
|---|---|
| `P4-SI-01` | Only `package.json.version` and current-source documents advance to exact `0.1.0-preview.4`; the closed spec agrees. |
| `P4-SI-02` | Compiler, authored artifact, recipe, profile, pack, registry, prompt, provenance, summary, and lockfile identities remain byte-identical. |
| `P4-SI-03` | Preview/Generic behavior and external-review limitations remain exact; no Community, Reviewed, or Flagship assignment appears. |
| `P4-SI-04` | Preview 3 release assets are byte-qualified and its Pages run did not deploy; Preview 2 is the qualified Pages rollback; any current public or live claim requires fresh version-bound evidence. |
| `P4-SI-05` | Preview 3 accessibility evidence stays historical; the Preview 4 fold correction is development/regression evidence, not source-freeze, release, conformance, or assistive-technology evidence. |
| `P4-SI-06` | Synthetic fixtures and static tooling policy are never presented as a real artifact, workflow execution, deployment, or public evidence. |
| `P4-SI-07` | Active release instructions use only pinned Preview 4 package/verifier paths; historical Preview 3 references remain clearly historical or predecessor bindings. |
| `P4-SI-08` | Claim regressions reject stale identity, temporal publication claims, cross-version paths, lifecycle/script drift, and review/tier promotion. |
| `P4-SI-09` | Exact thirteen-path scope, protected bytes, focused/full deterministic gates, dual typechecks, domain/cache/diff/accounting checks, and proof that no product/runtime source, build configuration, or lockfile changed pass; package version is the sole build-metadata change. |
| `P4-SI-10` | Two independent exact-byte reviews pass before checkpoint; no Preview 4 source manifest or release output exists. |

## Later exact boundaries

This exact thirteen-path checkpoint is source candidate `S4`. The pinned `preview4-package.py freeze-source` and qualification protocol must bind those exact committed bytes; they do not create a descendant source identity. Any source-byte change invalidates the candidate and requires a new reviewed source commit. Packaging commit `P4` has sole parent `S4` and exactly seven paths: `SHA256SUMS`, `docs/PROJECT-STATE.md`, `docs/TRACEABILITY.md`, `docs/evidence/releases/0.1.0-preview.4.md`, this contract, and the exact Preview 4 manifest and archive. Exact public values require fresh user confirmation after those bytes exist.

## Verification

Run the focused claim/workflow test, full Vitest, all Python release tests, both TypeScript configurations, forbidden-domain/protected-path/cache/scope/net/diff checks, and two independent reviews. Do not build or run browsers: the only build-adjacent change is `package.json.version`, which is not imported by runtime or build code; the later clean `S4` qualification owns the sole release build and its audit/browser evidence.

A pre-implementation development build at base `93e74f5` succeeded with three files, but the historical Preview 3 manifest correctly rejected those fold-corrected bytes. That ignored `dist` is non-evidence and must be absent before the later `S4` release build; successful release audit waits for the real Preview 4 manifest after source freeze.

The first frozen reviews returned ambiguous review/tier wording, split `S`/`S4` identity, stale chronology and future-tense publication claims, and insufficient promotion negatives. The smallest responsible documentation and claim-test layers now preserve those exact failures as permanent regressions; the repaired bytes required both reviews again and received both PASSes recorded below.

Repaired fingerprint `4C76985A43A858B3A9CAD394A01553B170D00EF276CD5EBD46DD2AB7DCA78293` received both zero-finding substantive PASSes. This completion update changes only Project, Trace, and this contract; those status bytes carry no substantive verdict and are checkpoint-eligible only under a separate exact-hash administrative PASS. Once that condition is satisfied, the exact next action is the thirteen-path `S4` checkpoint without another status edit.

## Stop conditions

Stop on a fourteenth path, net `>=350` lines (target `<250`), lockfile/tool/product/distributable drift, unsupported current-Pages claim, tier/review promotion, real Preview 4 release output, source freeze, remote action, or any need to change user behavior.

## Handoff

Record exact paths/hashes/net, gates, the runtime/build-input diff, reviews, skips, limitations, and the one next source-freeze action. Do not freeze, package, push, tag, publish, dispatch, deploy, or claim readiness in this package.
