# Preview 3 Pages policy

## Objective

Make Pages verify, browser-test, and upload the checked-in Preview 3 archive
only from `main`, without rebuilding or unnecessary permissions.

## Source of truth

- Publication/same-byte contracts, ADR-029, archive repair `70858f1`, and
  beginner journey `3c2a606`
- Official refs read 2026-08-17: checkout `11d5960a326750d5838078e36cf38b85af677262`;
  pnpm tag object `f40ffcd9367d9f12939873eb1018b921a783ffaa`, peeled
  `b906affcce14559ad1aafd4ab0e942779e9f58b1`; setup `49933ea5288caeca8642d1e84afbd3f7d6820020`;
  upload `56afc609e74202658d3ffba0e8f6dda462b719fa`; deploy `d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e`
- Preserved dirty workflow/audit draft and the reproduced independent findings

## In scope

Exactly these package-owned paths:

```text
.github/workflows/pages.yml
docs/DECISIONS.md
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/work-packages/PREVIEW-3-PAGES-POLICY.md
docs/work-packages/PREVIEW-3-PUBLICATION.md
docs/work-packages/PREVIEW-3-SAME-BYTE-PIPELINE.md
scripts/release-audit.mjs
tests/release/release-audit.test.ts
```

Consolidate the workflow/audit draft: exact peeled action commits, two main
guards, job-scoped privilege, `--require-packaging-commit`, and no Pages build.

The audit accepts `dist` alone or one closed schema-1 manifest. Finite budgets
reject invalid entries/paths/manifests, forbidden content, source maps, and an
ineffective CSP. Browser checks are followed by the same audit before upload.

## Out of scope

- Freeze/build/package/push/tag/release/dispatch/deployment/public reads
- Compiler, profile, pair, recipe, prompt/provenance, UI, or journey behavior
- Action/dependency upgrades, Gate 4+, backend, telemetry, models, or tier work

## Acceptance

| ID | Observable evidence |
|---|---|
| `PP-01` | All five actions use the exact 40-character commits above; no mutable `uses:` tag remains. |
| `PP-02` | Both verify and deploy jobs require exact `refs/heads/main`; manual dispatch from another ref deploys nothing. |
| `PP-03` | Verify has only `contents: read`; deploy alone has `pages: write` and `id-token: write`. Checkout persists no credential and fetches only required parent history. |
| `PP-04` | Pages runs source tests/typechecks, archive regressions, exact packaging-commit verification/extraction, manifest audit, browser tests against extracted `dist`, post-browser audit, then upload. |
| `PP-05` | Pages contains no build command and upload consumes only the twice-audited extracted `dist`. |
| `PP-06` | Wrong verifier flags, non-main guards, mutable pins, elevated permissions, missing post-audit, or second-build behavior fail permanent workflow-policy tests. |
| `PP-07` | Release audit uses `lstat`, bounded reads, and finite entry/file/depth/byte limits; links, non-regular entries, invalid roots, and excess inputs fail closed. |
| `PP-08` | Optional manifest JSON rejects duplicate keys and is bounded, closed, exact-typed, portable-ASCII, sorted, unique, and byte/hash-equal to the exact one-directory/three-file output; one canonical HTML template binds CSP/local assets, and extra CLI input fails. |
| `PP-09` | Focused positive and negative release-audit tests, full Vitest, both typechecks, workflow scan, build, historical checksums, diff hygiene, and independent read-only review pass. |
| `PP-10` | No release byte, protected product source, remote ref, or public state changes in this package; combined Preview 3 source remains unfrozen. |

## Verification

```text
pnpm test -- tests/release/release-audit.test.ts
pnpm test
pnpm exec tsc -p tsconfig.json --noEmit
pnpm exec tsc -p tsconfig.domain.json --noEmit
pnpm build
node scripts/release-audit.mjs
git diff --check
```

Also scan workflow policy, nine historical checksums, protected paths/cache,
exact package scope/size, and independent review. Current `dist` is development
output, not qualified Preview 3 bytes.
Net lines mean Git numstat additions minus deletions, with each untracked file
counted through `git diff --no-index --numstat NUL <path>`.

## Stop conditions

Stop on an unproved ref, rebuild/unverified upload, non-main deployment, excess
permission/credential, followed link, missing parent, unbounded audit, fake
CSP, release/product-byte change, unrelated baseline failure, or net size 700.

## Handoff

Record pins, guards, audit evidence, verdict, checkpoint, and remaining work in
`PROJECT-STATE.md` and `TRACEABILITY.md`. Checkpoint only the nine owned paths;
do not freeze, package, push, tag, dispatch, deploy, or publish.
