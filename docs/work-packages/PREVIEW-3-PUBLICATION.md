# Preview 3 qualification and publication

## Objective

Publish one byte-qualified public prerelease, `0.1.0-preview.3`, containing the
reviewed one-way Interpreter, progressive Advanced settings, five additional
Generic language identities, and a clearer beginner handoff without claiming
Gate 3 exit, stable readiness, linguistic review, or accessibility conformance.

## Source of truth

- User authorization on 2026-07-24 to finish and push a release
- User authorization on 2026-08-17 for the five-language expansion and public
  result
- Gate 3 Interpreter checkpoint
  `c2e6104e3b47ef180d5e27da5147d31b59ee4ebf`
- Gate 3.5 checkpoint
  `e96f4b51a3bc49102acd66361b1a88d38f40e472`
- `docs/RELEASE-WORKFLOW.md`
- `docs/evidence/releases/0.1.0-preview.2.md`
- `docs/ACCESSIBILITY.md`, `docs/LIMITATIONS.md`, and
  `docs/PUBLICATION-MANIFEST.md`
- `.github/workflows/pages.yml`, `scripts/release-audit.mjs`, and
  `tests/e2e/preview.spec.ts`
- ADR-028 through ADR-034

## In scope

The source work is intentionally split at the accepted 700-net-line boundary:

1. `PREVIEW-3-SOURCE-CLAIMS` owns prerelease identity, public claims, and
   missing browser/axe coverage.
2. `PREVIEW-3-SAME-BYTE-PIPELINE` owns release-byte validation, archive safety,
   and Pages mechanics.
3. `PREVIEW-3-ARCHIVE-VERIFIER-REPAIR` repairs the returned archive checkpoint.
4. `GENERIC-LANGUAGE-COHORT-1` owns the exact registry/profile migration.
5. `PREVIEW-3-BEGINNER-JOURNEY` owns plain-language presentation only.
6. `PREVIEW-3-PAGES-POLICY` owns main-only, immutable same-byte deployment.
7. `PREVIEW-3-SOURCE-MANIFEST-AND-PACKAGER` Child A owns complete-tree source
   identity; Child B owns same-byte staging, promotion, regressions, and claim
   alignment.

Each package has exact owned paths, acceptance, checks, independent review, and
a local checkpoint. Only their clean combined descendant after Pages policy
and a fresh complete qualification may become the source freeze.

The source-claims subpackage is checkpointed at
`aa75e60040ad2eeb5b55223fa83ff87b71031eaf`; returned archive checkpoint
`83558bdc373a7e8ec8d1f18d6713f526c2aad505` is repaired by
`70858f1c4157af3340cea6c95f50cf9fd387ffbf`. Those checkpoints remain useful
history. Generic catalog checkpoint
`db85ed4a09f2e960ce0f6a31f84844b6e719bdf6` advances the registry and profiles.
Beginner-journey checkpoint
`3c2a6061c68817fdd1d1718bd00b97ab9dd46f6e` advances presentation only.
None is a freeze after the authorized expansion. Source-manifest core
checkpoint `e421e0a3248d9d7c1730929697920f8b757b8792` and regression checkpoint
`06cc7cb032ec7798accb8757d10a21df75fcefdb` add reviewed construction tooling
without generating evidence bytes. Same-byte package core checkpoint
`cc61a60205c04bd34709acb0fa6b071802de0526` and regression checkpoint
`7a58f7cff087e49bce73ce827bff7ce8cbbbb11c` add reviewed staging/promotion
tooling and permanent returned-failure coverage. Child B3 governing-claim
alignment received independent exact-byte administrative PASSes. Source
`9bc73b96a48d2ca96f0b4460da860afe954a3eb8` was locally frozen and
qualified, but its derived seven-path package was returned after final review
found two public limitations claims that would become false at commit time. A
consolidated repair then removed the same temporal-status failure family from
the other public release-status documents.
That source and package are development/regression evidence only; no `P` or
publication was established. `PREVIEW-3-COMMIT-STABLE-CLAIMS` owns the exact
replacement source repair. Replacement source
`58890218721c16e2226d42d6bc6ccd98622ae30c` (`S2`) has since been locally
frozen, fully qualified, built once, and packaged under the exact boundaries
below. That local work is not a publication claim.

Source-freeze phase:

- Add missing axe coverage for Advanced-open Written and Voice, Voice Review,
  and 320 px Voice-open overflow.
- Correct stale journey-count and Interpreter publication-state claims.
- Keep the package/public prerelease identity at `0.1.0-preview.3`; compiler,
  policy, recipe, profile, pair-pack, and prompt-surface versions remain
  unchanged while the exact registry version/hash and prompt provenance
  advance under ADR-030.
- Add five identity-only profiles and clearer beginner-facing presentation;
  do not add pair guidance or a review-tier claim.
- Make Pages deploy the exact checked-in qualified archive instead of a CI
  rebuild.
- Update release-facing README, notes, limitations, accessibility, publication
  inventory, traceability, and current-state records.
- Derive one canonical complete-tree source manifest from the exact clean
  source commit; never restore a manual path union as authority.
- Add deterministic release-package staging and exact promotion.

Complete source-freeze authority:

The reviewed `freeze-source` command enumerates every regular `100644` blob in
the exact source commit and creates one fixed canonical manifest binding commit,
tree, portable path, length, and SHA-256. Its `verify-source` companion
reconstructs and byte-compares that manifest. The former hand-maintained path
list is retired because it could omit newly added source. Index and raw
worktree checks are equality gates, not another inventory. The tool is locally
checkpointed. The returned 27,443-byte Preview 3 source manifest binds
`S=9bc73b96a48d2ca96f0b4460da860afe954a3eb8`, its tree, and 142 files with
SHA-256 `A12CE50BCB511E7AFDFF69909F3A502F6EE553C32D9E10A4889AD879139C6FA4`.
It cannot qualify the replacement source and remains regression evidence only.
The replacement 27,655-byte, 143-file manifest has SHA-256
`73629B908E38AF22E8601F6C83D8FEA69EA6DF675DD8D5BD35EE2C04459148E2`
and binds `S2` plus tree
`802c0952bcaa5855aa47dadb2f423fb34f5150c3`.

Packaging phase:

- Build once from one clean source commit.
- Create one Pages ZIP and one byte manifest from that exact `dist`.
- Append, never replace, checksum and release-evidence records.
- Independently review the frozen source and package bytes.
- Present the exact repository, source/package commits, version, tag, asset
  names/hashes/lengths, Pages target, and Preview 2 rollback artifact for the
  final publication confirmation required by the release workflow.

Exact packaging-commit owned paths:

```text
SHA256SUMS
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
docs/evidence/releases/0.1.0-preview.3.md
docs/work-packages/PREVIEW-3-PUBLICATION.md
release/phrasegarden-0.1.0-preview.3-pages-manifest.json
release/phrasegarden-0.1.0-preview.3-pages.zip
```

The returned local package candidate had archive SHA-256
`48C2A6CE0233C1BE66018E4C8A3915040DB5ADCBCFF3C40BA33B534F8E21DAFA`,
release-manifest SHA-256
`A1828D387743903F6DD9ABF18E680E858FC2F6CF1DB194C8065C2F6F277409DC`,
and appended-ledger SHA-256
`6623FD24D1DAD70A147B307E64A1807BC5C77C9348FAE28B0CDBD772A0B2C08D`. It passed
the complete local source run, 3/3 extraction comparison, and two independent
frozen source/package reviews. Final exact-candidate review then returned the
commit-unstable limitations wording. These hashes are preserved as regression
evidence; they must not be committed as `P`, and the replacement source must be
frozen, qualified, built, packaged, and reviewed again. Exact-value publication
confirmation remains a later boundary.

The replacement package is promoted locally from the exact qualified `S2`
build. Its 179,217-byte archive intentionally has the same SHA-256,
`48C2A6CE0233C1BE66018E4C8A3915040DB5ADCBCFF3C40BA33B534F8E21DAFA`,
because the distributable bytes are unchanged. Its replacement 976-byte
release manifest is
`C72862B522305104CC135C00FC31CC47881D8F9DCC6232B77CE027738D9D3B5F`;
its 1,244-byte append-only checksum ledger is
`E65D2D74EF7374B65E12B7898F54D83164093C267B090D0E4E7EC95B578DEA2A`.
Exact-source qualification passed 312/312 Vitest, 45/45 Python release tests,
both typechecks, zero forbidden-domain matches, one 53-module build, pre/post
audits, 12/12 sequential Edge/axe journeys, 9/9 historical checksums, source
reverification, direct screenshot inspection, and 3/3 staged ZIP binding. Two
independent source/package reviews returned PASS with zero open P1/P2/P3.

The first exact seven-path packaging-evidence candidate was returned because it
made fresh remote preflight a condition of local `P`. The repaired content
keeps `P` local and moves remote preflight after `P`, before publication
confirmation. Both independent reviewers returned PASS with zero open P1/P2/P3
on the repaired seven-content fingerprint
`16CC7104E4BE9CA7ACBBA09027768280645280E3D98EE2D1D1878E9780C0AE66`,
defined as SHA-256 over the sorted seven `path|SHA-256` UTF-8/LF lines. The
final administrative closure changes only Project State, Traceability, release
evidence, and this contract and requires a narrow zero-finding rebind before
staging.

The containing commit becomes `P` only if an independent review binds the exact
seven owned paths with zero findings, its sole parent is `S2`, its changed paths
equal the allowlist byte-for-byte, and the packaging-commit verifier passes.
Exact-value publication confirmation remains separate. No push, tag, GitHub
prerelease, Pages deployment, or public verification is established here.

Publication phase:

- Fast-forward `main` only to the confirmed package commit.
- Create unused tag `v0.1.0-preview.3` and a GitHub prerelease with the exact
  ZIP, manifest, and checksum ledger.
- Let Pages deploy the exact ZIP bytes.
- Re-download all release and Pages bytes unauthenticated, compare exact
  lengths and SHA-256 values, and run the named production smoke journeys.

## Out of scope

- Gate 4 local ownership, imports, exports, library, or sharing
- Japanese interface localization or linguistic-review claims
- Service worker, durable cold-offline behavior, backend, account, telemetry,
  runtime model integration, or prospective/model evaluation
- Stable release, Gate 3 exit, WCAG conformance, broad browser/OS claims, or
  manual screen-reader/IME/forced-colors qualification
- Rewriting, deleting, replacing, or retagging Preview 1 or Preview 2

## Acceptance

| ID | Observable evidence |
|---|---|
| `P3-01` | `0.1.0-preview.3` is consistently identified as a prerelease; authored artifact versions remain unchanged while the explicit registry migration advances its own version/hash and prompt provenance. |
| `P3-02` | Written and Voice Advanced-open states plus Voice Review receive zero-violation axe checks; Voice-open has a 320 px no-overflow assertion. |
| `P3-03` | Full Vitest, both typechecks, forbidden-domain scan, one build, release audit, and all sequential Playwright/axe journeys pass on one clean source commit. |
| `P3-04` | Manual screenshot inspection covers desktop and 320 px closed/open states with no visible clipping, overlap, or page overflow. |
| `P3-05` | The release archive contains exactly the manifest paths and bytes from the single qualified `dist`; ZIP paths are canonical. |
| `P3-06` | CI extracts and verifies the checked-in ZIP, runs tests against those bytes, and uploads the same extracted directory without rebuilding it. |
| `P3-07` | `SHA256SUMS` preserves all nine old targets and adds exactly the Preview 3 archive and manifest. |
| `P3-08` | Independent review reports zero open P1/P2/P3 for frozen source, package, claims, and rollback boundary. |
| `P3-09` | Remote `main`, tag, release assets, and Pages deployment use only the exact confirmed commits and bytes. |
| `P3-10` | Public release assets and every Pages file re-download with exact expected length and SHA-256. |
| `P3-11` | Production Written, Voice, Interpreter, Preview/Generic, Advanced, copy/download, keyboard, 320 px, CSP, and runtime-request smoke checks pass. |
| `P3-12` | Preview 2 remains immutable and named as the rollback artifact; no Gate 3 exit, stable, conformance, or linguistic-review claim is made. |

## Verification order

1. Focused accessibility/browser cases and documentation scans.
2. Full Vitest and both typechecks.
3. Verify source-manifest and package-staging tooling, then exclusively create
   the clean descendant's complete-tree manifest and qualify those exact bytes.
4. Build once, audit, run Playwright directly against that `dist`, and inspect
   screenshots.
5. Package, hash, extract, compare, and independently review exact bytes.
6. Obtain exact-value publication confirmation.
7. Push, tag, release, deploy, re-download, compare, and run production smoke.

No build, package, or public byte is regenerated after its output has
influenced a qualification decision.

## Stop conditions

Stop on a test, axe, type, build, package, privacy, CSP, runtime-request,
independent-review, remote-ref, or public-byte mismatch; post-freeze source
mutation; used or moved tag; non-fast-forward `main`; unexpected release asset;
changed Pages target; inability to preserve Preview 2; or any claim stronger
than the evidence. Never replace, retag, or silently redeploy a failed public
candidate.

## Handoff

Record the exact source and package commits/trees, manifest and archive hashes,
checks, failures, independent verdict, remote refs, workflow run, public asset
hashes, production smoke evidence, known limitations, and rollback target in
`docs/evidence/releases/0.1.0-preview.3.md` and `docs/PROJECT-STATE.md`.
