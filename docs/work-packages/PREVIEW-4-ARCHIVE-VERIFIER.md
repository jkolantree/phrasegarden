# Preview 4 archive-verifier foundation

Status: completed local checkpoint `3fc477d86e66dbfcf3485b71beccfcadfb9a7291` | Base: `c245244400858d759176b4d0679c343b700a5fde` | Updated: 2026-08-18

## Objective

Provide one deterministic verifier with pinned Preview 3/4 adapters, no user-selectable identity, and compatible Preview 3 behavior.

## Source of truth

Immutable source: `release_packager.py` specs; base verifier/tests; `SHA256SUMS` and committed P3 files; ADR-034 and `RELEASE-WORKFLOW.md`.

## In scope

Exact paths: `docs/work-packages/PREVIEW-4-ARCHIVE-VERIFIER.md`, `docs/DECISIONS.md`, `docs/PROJECT-STATE.md`, `docs/TRACEABILITY.md`, `scripts/release_packager.py`, the shared verifier and both adapters, and both Python release tests. Captured failures expanded this causal package, which stays below 650 net lines.

**Out of scope:** version/workflow/public claims, freeze/build/archive/ledger/evidence, remote writes/deployment, P3 mutation, UI/browser/model work.

## Acceptance

- **P4-AV-01 — Closed selection:** only exact specs exist; adapters pin IDs, direct core execution fails, and ambient input never selects.
- **P4-AV-02 — Preview 3 compatibility:** canonical bounded CLI/help/success/output and established error ordering remain exact; newly hostile, redirected, nonregular, or over-budget Git states intentionally fail closed.
- **P4-AV-03 — Manifest identity:** packaging requires exact selected version/name; malformed or crossed inputs fail, while ordinary extraction stays nonqualifying.
- **P4-AV-04 — Argument identity:** raw checksum/manifest/archive tokens equal exact spec paths; crossed, normalized, or aliased spellings fail before extraction.
- **P4-AV-05 — Commit identity:** bounded pre/post physical object/path checks plus config-independent, no-replacement/no-lazy-fetch, typed-rehashed Git prove one exact parent, seven paths, pre/read/post-bound HEAD/worktree-equal blobs, and exactly two appended ledger lines; adversarial swap-use-restore is not claimed.
- **P4-AV-06 — Preview 4 source version:** bounded strict parent `package.json` has the exact version; Preview 3 retains its historical policy.
- **P4-AV-07 — Predecessor lineage:** Preview 4 proves pinned ledger length/hash, suffix, and committed Preview 3 bytes; Preview 3 keeps its historical policy.
- **P4-AV-08 — Archive boundary:** existing checksum/JSON/ZIP/path/type/count/byte/hash/fresh-output bounds and all negative cases remain fail closed.
- **P4-AV-09 — Determinism:** accepted bytes and domain validation order are deterministic without browser/storage/network/clock/`Intl`; private atomic staging may use randomness, and host OS diagnostics are explicitly noncanonical.
- **P4-AV-10 — Consumers:** packager tests use the core and retain P3 golden bytes.
- **P4-AV-11 — No promotion:** passing proves structure/bytes, not human or linguistic truth, publication, deployment, or readiness.
- **P4-AV-12 — Negatives:** retain wrong/crossed identities, malformed package, changed lineage, wrong commit/worktree, direct selection, Git redirects/config/alternates/partial state/object mismatch/output limits, P3 differentials, and prior failures.

## Verification

Run bundled Python `-B` focused/all release tests; P3 base/current qualifying and ordered-error differentials; hostile Git/object probes; full Vitest; dual typechecks; build; current-dist audit; ledger, domain/cache/scope/net/diff scans; exact adapter probes; then zero-finding independent exact-byte review. No browser: no UI/output bytes change.

## Stop and handoff

Stop on insufficient spec semantics, canonical P3 drift, ambiguous identity, `>=650` net lines, unrelated/scope drift, generated release output, or truth overclaim. Handoff reports paths/hashes, checks, net lines, review, failures, skips, and next package; stop before Pages or Preview 4 public identity.
