# Preview 8 local package and Pages boundary

Status: exact seven-path local content record; checkpoint eligibility is
conditional on an external exact-byte PASS

Source: `S8=44df6aef96b0cbc87c9e116810c7b096a082cdb6` | Updated: 2026-08-20

## Objective

Prepare one reviewed same-byte Preview 8 package for a separately authorized
Pages update, including the visibly unreviewed Japanese interface preview,
without changing prompts, language-pair support, or privacy behavior.

## Source of truth

Exact corrected `S8` and tree; 36,862-byte complete-tree source manifest;
closed Preview 8 `ReleaseSpec`; literal package/verifier adapters; one reviewed
three-file `dist`; immutable Preview 7 ledger/archive/manifest; the retained
ledger-lifecycle failure; this contract; and `docs/RELEASE-WORKFLOW.md`.

## In scope

Exactly seven packaging-commit paths:

```text
SHA256SUMS
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/evidence/releases/0.1.0-preview.8.md
docs/work-packages/PREVIEW-8-PUBLICATION.md
release/phrasegarden-0.1.0-preview.8-pages-manifest.json
release/phrasegarden-0.1.0-preview.8-pages.zip
```

## Out of scope

Source or product changes; another build, restage, or promotion; mutation of
Preview 1–7; prompt/compiler/profile/recipe/pair-pack changes; tier promotion;
runtime AI, backend, accounts, storage, telemetry, or sharing; a tag or GitHub
Release; qualified Japanese review, screen-reader, WCAG, or release-readiness
claims; push, deployment, or other public mutation without exact authorization.

## Acceptance

| ID | Observable evidence |
|---|---|
| `P8-PKG-01` | At corrected-S8 source qualification, its tree and complete-tree manifest bound all 189 committed `100644` files and raw worktree bytes. |
| `P8-PKG-02` | English/Japanese entry, unreviewed-Japanese disclosure, English recovery, prompt preservation, and forced-colors regressions pass without changing protected prompt/domain bytes or support tiers. |
| `P8-PKG-03` | One build from corrected `S8` produces exactly three audited files and passes 15 sequential browser/axe journeys. |
| `P8-PKG-04` | Canonical corrected stage preserves the exact Preview 7 ledger and receives independent product/language/accessibility/privacy and release/security PASSes. |
| `P8-PKG-05` | One successful owner-context promotion copies corrected stage to final ZIP, manifest, and ledger with exact byte equality. |
| `P8-PKG-06` | These exact seven paths receive an external read-only review with zero open P1/P2/P3. |
| `P8-PKG-07` | Sole-parent `P8` passes the pinned committed-package verifier and fresh extraction comparison. |
| `P8-PKG-08` | One separately authorized main push triggers Linux Chromium/axe and deployment; warning annotations and public HTML/CSS/JavaScript bytes are then verified without rebuilding. |

The returned cycle is development/regression evidence only. A post-promotion
58/58 Python pass on corrected `S8` and the corrected final ledger is required;
57 passing cases followed by the captured lifecycle failure cannot qualify it.

## Verification

Compare filesystem and Git bytes directly by length and SHA-256. Run the
committed-package verifier into a fresh ignored extraction. Do not push until
remote identity and ancestry are freshly checked and the user explicitly
authorizes that exact external action. If authorized, inspect the one automatic
run and compare public HTML, CSS, and JavaScript with the manifest.

## Stop conditions

Source, stage, `dist`, or final drift; extra path; open P1/P2/P3; wrong parent,
mode, blob, ledger prefix, or append order; another build/stage/promotion;
workflow or public-byte failure; remote drift; tag/release action; missing
external authorization; or a claim stronger than evidence.

## Handoff and authority

Changed files, tests, hashes, limitations, and invalid observations are in
`docs/evidence/releases/0.1.0-preview.8.md`. This record does not self-hash. An
external review receipt alone establishes `P8-PKG-06`; a qualifying Git commit
plus verifier output alone establishes `P8-PKG-07`; observed Actions and public
bytes alone establish `P8-PKG-08`. A zero-finding review permits checkpointing
these exact unchanged bytes without a status edit.
