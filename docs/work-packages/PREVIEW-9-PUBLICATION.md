# Preview 9 local package and Pages boundary

Status: exact seven-path local content record; checkpoint eligibility is
conditional on an external exact-byte PASS

Source: `S9=464239831bb856dbe6d2b045dc5c59607d8b91aa` | Updated: 2026-08-20

## Objective

Prepare one reviewed same-byte Preview 9 package for a separately authorized
Pages recovery, preserving the immutable Preview 8 failure and all product,
language, support-tier, prompt, and privacy boundaries.

## Source of truth

Exact S9 and tree; 38,276-byte complete-tree source manifest; closed Preview 9
`ReleaseSpec`; literal package/verifier adapters; one reviewed three-file
`dist`; immutable Preview 8 ledger/archive/manifest and returned Pages result;
this contract; and `docs/RELEASE-WORKFLOW.md`.

## In scope

Exactly seven packaging-commit paths:

```text
SHA256SUMS
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/evidence/releases/0.1.0-preview.9.md
docs/work-packages/PREVIEW-9-PUBLICATION.md
release/phrasegarden-0.1.0-preview.9-pages-manifest.json
release/phrasegarden-0.1.0-preview.9-pages.zip
```

## Out of scope

Source or product changes; another build, stage, or promotion; mutation of
Preview 1–8 or its failure evidence; prompt/compiler/profile/recipe/pair-pack
changes; tier promotion; runtime AI, backend, accounts, storage, telemetry, or
sharing; qualified Japanese review, screen-reader, WCAG, or release-readiness
claims; a tag or GitHub Release; push, deployment, or other public mutation
without exact authorization.

## Acceptance

| ID | Observable evidence |
|---|---|
| `P9-PKG-01` | Exact S9 has sole parent P8, exactly 21 changed paths, and a qualified 38,276-byte complete-tree manifest binding 196 committed files. |
| `P9-PKG-02` | English and Japanese 320 × 900 Home primary-action bottoms are at most 800 px from the viewport top, remain at least 44 px high, and preserve reflow, focus, disclosure, prompt, tier, and privacy behavior. |
| `P9-PKG-03` | One Node 24.19.0 / pnpm 11.9.0 build from S9 produces exactly three audited files; 15/15 Chromium/axe and 15/15 Edge/axe journeys consume the same bytes. |
| `P9-PKG-04` | The canonical stage preserves the exact 2,424-byte Preview 8 ledger, appends only P9 ZIP then manifest, and receives two independent PASSes. |
| `P9-PKG-05` | One same-byte promotion copies the reviewed stage to final ZIP, manifest, and ledger with exact byte equality. |
| `P9-PKG-06` | These exact seven paths receive an external read-only review with zero open P1/P2/P3. |
| `P9-PKG-07` | Sole-parent `P9` passes the pinned committed-package verifier and fresh extraction comparison. |
| `P9-PKG-08` | One separately authorized main push triggers Linux Chromium/axe and deployment; public HTML/CSS/JavaScript bytes are then compared without rebuilding. |

The sandboxed source-freeze failure and early duplicate-port browser setups are
invalid environment/harness observations. They are retained but cannot qualify
any acceptance row.

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
`docs/evidence/releases/0.1.0-preview.9.md`. This record does not self-hash. An
external exact-byte review alone establishes `P9-PKG-06`; a qualifying Git
commit plus verifier output alone establishes `P9-PKG-07`; observed Actions
and public bytes alone establish `P9-PKG-08`. A zero-finding review permits
checkpointing these exact unchanged bytes without a status edit.
