# Preview 6 local package and Pages boundary

Status: exact seven-path local content record; checkpoint eligibility is
conditional on an external exact-byte PASS

Source: `S6=f442677f494eb36e0177c023e287a9de47573dbe` | Updated: 2026-08-19

## Objective

Deploy one narrow mobile Review correction as an immutable Preview 6 Pages
package while preserving Preview 5 and every prompt/domain byte.

## Source of truth

Exact `S6` and tree; 32,705-byte complete-tree source manifest; closed Preview
6 `ReleaseSpec`; pinned package/verifier adapters; reviewed three-file `dist`;
immutable Preview 5 ledger/archive/manifest; this contract; and
`docs/RELEASE-WORKFLOW.md`.

## In scope

Exactly seven packaging-commit paths:

```text
SHA256SUMS
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/evidence/releases/0.1.0-preview.6.md
docs/work-packages/PREVIEW-6-PUBLICATION.md
release/phrasegarden-0.1.0-preview.6-pages-manifest.json
release/phrasegarden-0.1.0-preview.6-pages.zip
```

## Out of scope

Source or product changes; another build, restage, or promotion; mutation of
Preview 1–5; prompt/compiler/profile/recipe/pair-pack changes; tier promotion;
runtime AI, backend, accounts, storage, telemetry, or sharing; a tag or GitHub
Release; linguistic-review, screen-reader, WCAG, or release-readiness claims.

## Acceptance

| ID | Observable evidence |
|---|---|
| `P6-PKG-01` | Exact `S6`, tree, and complete-tree manifest bind all 168 committed `100644` files and raw worktree bytes. |
| `P6-PKG-02` | One pinned build produces exactly three audited files; JavaScript remains byte-identical to Preview 5. |
| `P6-PKG-03` | The 320 × 900 Review keeps support, limitation, and both orientation labels visible before Copy; Copy bottom is at most 800 px and actions remain at least 44 px. |
| `P6-PKG-04` | Canonical stage preserves the exact Preview 5 ledger and receives independent product/accessibility/security PASSes. |
| `P6-PKG-05` | One promotion invocation copies stage to final ZIP, manifest, and ledger with exact byte equality. |
| `P6-PKG-06` | These exact seven paths receive an external read-only review with zero open P1/P2/P3. |
| `P6-PKG-07` | Sole-parent `P6` passes the pinned committed-package verifier and fresh extraction comparison. |
| `P6-PKG-08` | One authorized main push triggers Linux Chromium/axe, deployment, and public-byte verification without rebuilding. |

## Verification

Compare filesystem and Git bytes directly by length and SHA-256. Run the
committed-package verifier into a fresh ignored extraction. Push `S6` and `P6`
together only after remote preflight. Inspect the one automatic run and compare
public HTML, CSS, and JavaScript with the manifest.

## Stop conditions

Source, stage, `dist`, or final drift; extra path; open P1/P2/P3; wrong parent,
mode, blob, ledger prefix, or append order; another build or promotion; Linux
Copy bottom over 800 px; hidden or reordered truth; workflow or public-byte
failure; remote drift; tag/release action; or a claim stronger than evidence.

## Authority-stable handoff

This record does not self-hash. An external review receipt alone establishes
`P6-PKG-06`; a qualifying Git commit plus verifier output alone establishes
`P6-PKG-07`; observed Actions and public-byte evidence alone establish
`P6-PKG-08`. A zero-finding review permits checkpointing these exact unchanged
bytes without a status edit.
