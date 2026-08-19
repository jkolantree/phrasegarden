# Preview 7 local package and Pages boundary

Status: exact seven-path local content record; checkpoint eligibility is
conditional on an external exact-byte PASS

Source: `S7=465f0516e58f1270529923027013565881be76e9` | Updated: 2026-08-19

## Objective

Deploy PhraseGarden Preview 7 from one reviewed same-byte package with clearer
accessibility semantics and official immutable Node 24 GitHub Action pins,
without changing prompts, language claims, or privacy behavior.

## Source of truth

Exact `S7` and tree; 34,329-byte complete-tree source manifest; closed Preview
7 `ReleaseSpec`; pinned package/verifier adapters; reviewed three-file `dist`;
immutable Preview 6 ledger/archive/manifest; this contract; and
`docs/RELEASE-WORKFLOW.md`.

## In scope

Exactly seven packaging-commit paths:

```text
SHA256SUMS
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/evidence/releases/0.1.0-preview.7.md
docs/work-packages/PREVIEW-7-PUBLICATION.md
release/phrasegarden-0.1.0-preview.7-pages-manifest.json
release/phrasegarden-0.1.0-preview.7-pages.zip
```

## Out of scope

Source or product changes; another build, restage, or promotion; mutation of
Preview 1–6; prompt/compiler/profile/recipe/pair-pack changes; tier promotion;
runtime AI, backend, accounts, storage, telemetry, or sharing; a tag or GitHub
Release; linguistic-review, screen-reader, WCAG, or release-readiness claims.

## Acceptance

| ID | Observable evidence |
|---|---|
| `P7-PKG-01` | Exact `S7`, tree, and complete-tree manifest bind all 176 committed `100644` files and raw worktree bytes. |
| `P7-PKG-02` | Named support/prompt semantics and forced-colors regressions pass without changing protected prompt/domain bytes. |
| `P7-PKG-03` | One pinned build produces exactly three audited files and passes 14 sequential browser/axe journeys. |
| `P7-PKG-04` | Canonical stage preserves the exact Preview 6 ledger and receives independent product/accessibility/language/security PASSes. |
| `P7-PKG-05` | One successful owner-context promotion copies stage to final ZIP, manifest, and ledger with exact byte equality. |
| `P7-PKG-06` | These exact seven paths receive an external read-only review with zero open P1/P2/P3. |
| `P7-PKG-07` | Sole-parent `P7` passes the pinned committed-package verifier and fresh extraction comparison. |
| `P7-PKG-08` | One authorized main push triggers Linux Chromium/axe, deployment, zero Node 20 warnings, and public-byte verification without rebuilding. |

## Verification

Compare filesystem and Git bytes directly by length and SHA-256. Run the
committed-package verifier into a fresh ignored extraction. Push `S7` and `P7`
together only after remote preflight. Inspect the one automatic run, require no
Node 20 warning annotations, and compare public HTML, CSS, and JavaScript with
the manifest.

## Stop conditions

Source, stage, `dist`, or final drift; extra path; open P1/P2/P3; wrong parent,
mode, blob, ledger prefix, or append order; another build or promotion;
workflow or public-byte failure; remote drift; tag/release action; or a claim
stronger than evidence.

## Authority-stable handoff

This record does not self-hash. An external review receipt alone establishes
`P7-PKG-06`; a qualifying Git commit plus verifier output alone establishes
`P7-PKG-07`; observed Actions and public-byte evidence alone establish
`P7-PKG-08`. A zero-finding review permits checkpointing these exact unchanged
bytes without a status edit.
