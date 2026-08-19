# Preview 5 local package and Pages boundary

Status: exact local seven-path content record; checkpoint eligibility is
conditional on an external exact-byte PASS

Source: `S5=16ad1fbf964e4ee6084457d27208c17ae5d413e9` | Updated: 2026-08-19

## Objective

Bind the human-first PhraseGarden interface to one exact local Preview 5 Pages
package, then deploy those same bytes through the already authorized main-only
Pages workflow without creating a tag or GitHub release.

## Source of truth

Exact `S5` and tree; 31,497-byte complete-tree source manifest; closed Preview
5 `ReleaseSpec`; pinned Preview 5 package/verifier adapters; reviewed
three-file `dist`; immutable Preview 4 ledger/archive/manifest; stage fingerprint
`B25BAFEA7EDF220D45DD8ACCF216A30C3ACCDC04777A391431808F2CE530EF8B`;
`RELEASE-WORKFLOW.md`.

## In scope

Exactly seven eventual packaging-commit paths:

```text
SHA256SUMS
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/evidence/releases/0.1.0-preview.5.md
docs/work-packages/PREVIEW-5-PUBLICATION.md
release/phrasegarden-0.1.0-preview.5-pages-manifest.json
release/phrasegarden-0.1.0-preview.5-pages.zip
```

## Out of scope

Source, product, prompt, compiler, profile, recipe, pack, runtime, dependency,
or workflow changes; another build or package generation; mutation of Preview
1–4; tag or GitHub release creation; tier promotion; linguistic-review claim;
WCAG or assistive-technology claim; backend, account, telemetry, sharing, or
Gate 4 work.

## Acceptance

| ID | Observable evidence |
|---|---|
| `P5-PKG-01` | Exact `S5`, tree, and complete-tree manifest bind all 162 committed `100644` inputs and raw worktree bytes. |
| `P5-PKG-02` | One successful pnpm 11.9.0 build produces exactly three audited files; the missing-Node-path launch produced no `dist` and supplies no evidence. |
| `P5-PKG-03` | Deterministic, type, browser/axe, source, audit, and visual checks consume the same distributable bytes. |
| `P5-PKG-04` | Canonical stage preserves the exact Preview 4 ledger and receives independent security and product/language/accessibility PASSes. |
| `P5-PKG-05` | One promotion process copies the reviewed stage exactly; direct stable-state comparison binds the final ZIP, manifest, and ledger. |
| `P5-PKG-06` | The exact seven paths receive a final read-only review with zero open P1/P2/P3. |
| `P5-PKG-07` | Sole-parent `P5` passes the committed-package verifier and a fresh extraction equals the reviewed stage and `dist`. |
| `P5-PKG-08` | Fresh remote preflight permits only the authorized main push; the workflow, deployment, and public bytes receive separate verification. |

## Verification

Use the pinned runtimes and literal Preview 5 adapters. Compare filesystem and
Git bytes directly by length and SHA-256. Reverify source around qualification;
audit before and after browser checks; verify and review the stage before one
promotion process; review all seven final paths before checkpointing; then run
the committed-package verifier into a fresh ignored directory. After the push,
inspect the exact Actions run and compare public Pages bytes with the manifest.

## Stop conditions

Source, stage, `dist`, or final drift; extra path; open P1/P2/P3; wrong parent,
mode, blob, ledger prefix, or append order; another build or promotion; verifier
or extraction mismatch; remote-main drift; failed workflow; public-byte
mismatch; unauthorized tag/release action; or any claim stronger than captured
evidence.

## Authority-stable handoff

This content record does not self-hash. An external review receipt alone
establishes `P5-PKG-06`; a qualifying Git commit plus verifier output alone
establishes `P5-PKG-07`; observed Actions and public-byte evidence alone
establish `P5-PKG-08`. A zero-finding review permits checkpointing these exact
unchanged bytes without another status edit.
