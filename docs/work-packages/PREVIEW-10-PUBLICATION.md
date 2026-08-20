# Preview 10 local package and Pages boundary

Status: exact seven-path local content record; checkpoint eligibility is
conditional on an external exact-byte PASS

Source: `S10=8638314b7e189adab6af5c957b4ae17ecbf4f2c8` | Updated: 2026-08-20

## Objective

Prepare one reviewed same-byte Preview 10 package for a separately authorized
Pages recovery while preserving the immutable Preview 9 Linux failure and all
product, language, support-tier, prompt, and privacy boundaries.

## Source of truth

Exact S10 and tree; 39,694-byte complete-tree source manifest; closed Preview
10 `ReleaseSpec`; literal package/verifier adapters; one reviewed three-file
`dist`; immutable Preview 9 ledger/archive/manifest and returned Pages result;
this contract; and `docs/RELEASE-WORKFLOW.md`.

## In scope

Exactly seven packaging-commit paths:

```text
SHA256SUMS
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/evidence/releases/0.1.0-preview.10.md
docs/work-packages/PREVIEW-10-PUBLICATION.md
release/phrasegarden-0.1.0-preview.10-pages-manifest.json
release/phrasegarden-0.1.0-preview.10-pages.zip
```

## Out of scope

Source or product changes; another build, stage, or promotion; mutation of
Preview 1–9 or its failure evidence; prompt/compiler/profile/recipe/pair-pack
changes; tier promotion; runtime AI, backend, accounts, storage, telemetry, or
sharing; qualified Japanese review, screen-reader, WCAG, or release-readiness
claims; a tag or GitHub Release; push, deployment, or other public mutation
without fresh exact authorization.

## Acceptance

| ID | Observable evidence |
|---|---|
| `P10-PKG-01` | Exact S10 has sole parent P9, exactly 20 changed paths, and a qualified 39,694-byte complete-tree manifest binding 203 committed files. |
| `P10-PKG-02` | English and Japanese 320 × 900 Home primary-action bottoms are at most 800 px, affected actions remain at least 44 px high, and content, reflow, focus, disclosure, prompt, tier, and privacy behavior remain intact. |
| `P10-PKG-03` | One Node 24.19.0 / pnpm 11.9.0 build from S10 produces exactly three audited files; 15/15 Chromium/axe and 15/15 Edge/axe journeys consume the same bytes. |
| `P10-PKG-04` | The canonical stage preserves the exact 2,660-byte Preview 9 ledger, appends only P10 ZIP then manifest, and receives two independent PASSes. |
| `P10-PKG-05` | One same-byte promotion copies the reviewed stage to final ZIP, manifest, and ledger with exact byte equality. |
| `P10-PKG-06` | These exact seven paths receive an external read-only review with zero open P1/P2/P3. |
| `P10-PKG-07` | Sole-parent P10 passes the pinned committed-package verifier and fresh extraction comparison. |
| `P10-PKG-08` | One separately authorized main push triggers Linux Chromium/axe and deployment; public HTML/CSS/JavaScript bytes are then compared without rebuilding. |

The invalid stale-port Chromium launch ran no product journey and supplies no
qualification evidence. It did not change the source, build, stage, or final
bytes used by the isolated passing run.

## Verification

Compare filesystem and Git bytes directly by length and SHA-256. Run the
committed-package verifier into a fresh ignored extraction. Do not push until
remote identity and ancestry are freshly checked and the user explicitly
authorizes that exact external action. If authorized, inspect the single
automatic run and compare public HTML, CSS, and JavaScript with the manifest.

## Stop conditions

Source, stage, `dist`, or final drift; extra path; open P1/P2/P3; wrong parent,
mode, blob, ledger prefix, or append order; another build/stage/promotion;
workflow or public-byte failure; remote drift; tag or GitHub Release action;
missing external authorization; or a claim stronger than the evidence.

## Handoff and authority

Changed files, checks, hashes, limitations, and invalid observations are in
`docs/evidence/releases/0.1.0-preview.10.md`. This record does not self-hash.
An external exact-byte review alone establishes `P10-PKG-06`; a qualifying Git
commit plus verifier output alone establishes `P10-PKG-07`; observed Actions
and public bytes alone establish `P10-PKG-08`. A zero-finding review permits
checkpointing these exact unchanged bytes without a status edit.
