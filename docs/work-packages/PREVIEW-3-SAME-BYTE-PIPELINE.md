# Preview 3 same-byte release pipeline

## Objective

Make local packaging and GitHub Pages verify, test, and deploy one exact
qualified Preview 3 archive without a second release build.
The work is split at the accepted review-size boundary:

1. `PREVIEW-3-ARCHIVE-BINDINGS` owns portable archive, manifest, checksum,
   source-parent, and exact packaging-delta validation.
2. `PREVIEW-3-PAGES-POLICY` owns immutable action pins, main-only deployment,
   post-browser filesystem audit, and upload mechanics.

Each child requires its own exact checkpoint; their clean combined descendant is the same-byte pipeline checkpoint.
## Source and owned paths

Source: `PREVIEW-3-PUBLICATION.md`, `docs/RELEASE-WORKFLOW.md`, checkpoints
`aa75e60`, `70858f1`, `db85ed4`, and `3c2a606`, plus the preserved
checksum-binding and Pages-policy failures.
Archive-bindings checkpoint owned paths:

```text
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/work-packages/PREVIEW-3-PUBLICATION.md
docs/work-packages/PREVIEW-3-SAME-BYTE-PIPELINE.md
scripts/verify-release-archive.py
tests/release/test_verify_release_archive.py
```
Archive bindings exclude the workflow, `release-audit.mjs`, actual artifacts,
remote refs, deployment, and Gate 4+. They must pass portable-path, archive, ledger-preservation, one-parent, exact packaging-delta, focused regression,
full unit/type, domain-scan, diff, line-budget, and independent review checks.
## Acceptance

- `release-audit.mjs` optionally consumes one closed schema-1 manifest and
  requires exact `dist` path, byte-length, and SHA-256 equality.
- The archive verifier requires exact ZIP and manifest entries in
  `SHA256SUMS`, rejects unsafe/duplicate/extra/missing/symlink members, verifies
  every manifest byte, and extracts only into a fresh directory.
- Permanent tests cover positive extraction and fail closed across checksum,
  path, member, budget, ledger, parent, and packaging-delta boundaries.
- Pages performs no Vite build: it verifies checksums/source parent, extracts
  the checked-in ZIP, audits it, runs Playwright directly against it, re-audits
  unchanged bytes, and uploads that directory.
- Verification and deployment require `refs/heads/main`; permissions are
  job-scoped and every action is pinned to an official-ref commit.
- Docs-only receipt commits do not trigger another deployment.
## Verification and stop

Run each child's focused negative fixtures, syntax, full Vitest and typechecks,
protected-path/diff hygiene, and independent read-only review. Stop on a
missing binding, unsafe extraction, mutable action, non-main deployment,
second build, unbound upload, unexpected path, or child package growth above
700 net lines.
## Handoff

Commit each child's exact owned paths. The clean combined descendant may then
enter the Preview 3 source-freeze qualification; no child checkpoint is itself
the freeze.
