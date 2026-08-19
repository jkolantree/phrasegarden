# Preview 4 source identity and publication boundary

Status: exact local seven-path content record; checkpoint eligibility is conditional on an external exact-byte PASS | Source: `115d71fc8830357d6a57037de446947cf9d7c99d` | Updated: 2026-08-18

## Objective

Advance the exact source and target-release identity to `0.1.0-preview.4`
without changing product, prompt, language, tier, privacy, or runtime behavior,
then bind one local package while keeping every public action separate.

## Source of truth

Closed Preview 4 `ReleaseSpec`; checkpoints `3a2cfd0`, `c245244`, `3fc477d`,
`93e74f5`, and exact `S4`; Preview 3 public asset and failed-Pages evidence;
Preview 2 qualified Pages rollback; ADR-033–ADR-037; `RELEASE-WORKFLOW.md`.

## Completed source-identity scope

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

This exact thirteen-path checkpoint is source candidate `S4`.
The pinned freeze and qualification protocol bind those exact committed bytes; they do not create a descendant source identity. The exact checkpoint is
`S4=115d71fc8830357d6a57037de446947cf9d7c99d`, tree
`651caf779623e3b9d0ae2be2fa9207ae3f64ce6c`. It received the required source
reviews before any Preview 4 source manifest or release output existed.

## Source-identity acceptance

| ID | Observable evidence |
|---|---|
| `P4-SI-01` | Only `package.json.version` and current-source documents advance to exact `0.1.0-preview.4`; the closed spec agrees. |
| `P4-SI-02` | Compiler, authored artifact, recipe, profile, pack, registry, prompt, provenance, summary, and lockfile identities remain byte-identical. |
| `P4-SI-03` | Preview/Generic behavior and external-review limitations remain exact; no Community, Reviewed, or Flagship assignment appears. |
| `P4-SI-04` | Preview 3 release assets are byte-qualified and its Pages run did not deploy; Preview 2 is the qualified Pages rollback. |
| `P4-SI-05` | Preview 3 accessibility evidence stays historical; Preview 4 evidence remains version-bound and does not claim conformance or broad assistive-technology coverage. |
| `P4-SI-06` | Synthetic fixtures and static tooling policy are never presented as real artifact, workflow, deployment, or public evidence. |
| `P4-SI-07` | Active release instructions use only pinned Preview 4 package/verifier paths; Preview 3 references are historical or predecessor bindings. |
| `P4-SI-08`–`P4-SI-10` | Claim regressions, exact thirteen-path scope, deterministic gates, two reviews, and no pre-checkpoint Preview 4 output all passed. |

## Local Package B contract

### Objective

Bind one exact local Preview 4 package to `S4` and reach the exact-value
public-confirmation boundary without performing a public action.

### Source of truth

Exact `S4`; the pinned Preview 4 package and verifier adapters; source manifest
`FE5D2AEBB3C325A20753249C5971A16CAADA54E2BFEED906562603F1F26F3F8B`;
the qualified three-file `dist`; Preview 3 ledger
`E65D2D74EF7374B65E12B7898F54D83164093C267B090D0E4E7EC95B578DEA2A`;
the fresh pnpm 11.9.0 staged-package reviews; and `RELEASE-WORKFLOW.md`.

### In scope

Exactly seven eventual commit paths:

```text
SHA256SUMS
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/evidence/releases/0.1.0-preview.4.md
docs/work-packages/PREVIEW-4-PUBLICATION.md
release/phrasegarden-0.1.0-preview.4-pages-manifest.json
release/phrasegarden-0.1.0-preview.4-pages.zip
```

### Out of scope

Source/product/tool/workflow changes; another build or package generation;
Preview 1–3 mutation; push, tag, release, dispatch, deployment, public
verification, tier promotion, linguistic-review claim, WCAG or
assistive-technology claim, Gate 4+, or release-readiness claim.

### Acceptance

| ID | Observable evidence |
|---|---|
| `P4-PKG-01` | Exact `S4`, tree, and complete-tree source manifest bind every build input. |
| `P4-PKG-02` | One successful pnpm 11.9.0 build in the corrected cycle produces exactly three audited files; the returned 11.19.0 candidate supplies no qualification. |
| `P4-PKG-03` | Deterministic, Python, type, browser/axe, source, audit, and visual checks consume those bytes. |
| `P4-PKG-04` | Canonical stage preserves the historical ledger and receives two independent fresh-cycle PASSes. |
| `P4-PKG-05` | One recorded promotion invocation copies the reviewed stage exactly; an independent promoted-byte audit passes. |
| `P4-PKG-06` | Exact seven-path content receives final review with zero open P1/P2/P3. |
| `P4-PKG-07` | Sole-parent `P4` passes the committed-package verifier and fresh extraction comparison. |
| `P4-PKG-08` | Exact public values receive fresh confirmation before any remote or public action. |

### Verification

Use pinned runtimes and adapters; compare direct bytes and SHA-256; run tests
before the single corrected-cycle build; audit before and after browser
qualification; reverify source; verify and review the stage before one
promotion invocation; freeze and review the seven paths; then verify the
containing commit into a fresh output and compare it to qualified `dist`.

### Stop conditions

Source/stage/dist drift; extra path; failed or repeated promotion; open
P1/P2/P3; wrong parent/mode/blob; verifier or extraction mismatch; remote or
public action before exact confirmation; or any claim stronger than captured
evidence.

## Local Package B record

The complete-tree source manifest binds 156 tracked files and 1,679,044 bytes
to exact `S4`. The corrected cycle used an independently inspected pnpm 11.9.0
runtime, passed 322/322 Vitest and 56/56 Python release/security tests, ran one
successful build with both TypeScript configurations, passed release audits
before and after 12/12 sequential Edge/axe journeys, and passed repeated source
verification.

The deterministic stage contains exact archive
`1797FE8289D44D8192EA5AFCE04A364B5F46A2E09A8F378598C4A71F1FE2A463`,
manifest
`3F89B96D42EFD4D39B0713BFC7058FB0065B6CAB96CCB3BB3785A7395CBB86C5`,
and ledger
`CB04A67C584205E12527C3FE3C5666B809BFD18CAE5F1E3ADCA51C5255E7FB7F`.
Two independent staged-byte reviews returned zero-finding PASS. One recorded
promotion invocation copied them to the final local paths; a separate review
bound the final bytes twice and returned zero-finding PASS.

An earlier pnpm 11.19.0 candidate is separately quarantined and returned. Its
identical payload hashes do not transfer execution or review authority to this
cycle. One premature orchestration poll during the corrected promotion is also
excluded as an invalid timing observation; the promotion process was not
retried.

## Exact remaining boundaries

Packaging commit `P4` must have sole parent `S4` and exactly the seven paths
above. The current four documentation bytes are intentionally not self-hashed;
an independent reviewer must bind all seven paths' exact bytes before the
checkpoint. The committed-package verifier and fresh extraction comparison
must then pass. Only after that may a fresh user confirmation bind repository,
commits, tag, asset hashes and lengths, Pages target, and rollback for public
action.

## Handoff

The original source-identity package is complete at exact `S4`. Package B's
archive, manifest, ledger, and four evidence documents form this exact local
content record. An external exact-byte receipt alone establishes
`P4-PKG-06`; a qualifying Git commit plus verifier output alone establishes
`P4-PKG-07`; fresh confirmation and public evidence alone establish
`P4-PKG-08`. A zero-finding review permits unchanged checkpointing without a
status edit. Do not push, tag, publish, dispatch, deploy, begin Gate 4, mutate
prior releases, or claim readiness without the required later authority.
