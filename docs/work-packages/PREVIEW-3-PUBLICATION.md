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
- ADR-028 through ADR-032

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
None is a freeze after the authorized expansion. Pages policy remains the
active separate package. The combined source is not frozen.

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
- Add a deterministic release-package verifier.

Exact source-freeze owned paths:

```text
.github/workflows/pages.yml
README.md
docs/ACCESSIBILITY.md
docs/DECISIONS.md
docs/LIMITATIONS.md
docs/PRODUCT.md
docs/PROJECT-STATE.md
docs/PUBLICATION-MANIFEST.md
docs/RELEASE-NOTES.md
docs/RECIPE-SCHEMA.md
docs/TRACEABILITY.md
docs/work-packages/GENERIC-LANGUAGE-COHORT-1.md
docs/work-packages/PREVIEW-3-ARCHIVE-VERIFIER-REPAIR.md
docs/work-packages/PREVIEW-3-BEGINNER-JOURNEY.md
docs/work-packages/PREVIEW-3-PAGES-POLICY.md
docs/work-packages/PREVIEW-3-PUBLICATION.md
docs/work-packages/PREVIEW-3-SAME-BYTE-PIPELINE.md
docs/work-packages/PREVIEW-3-SOURCE-CLAIMS.md
package.json
scripts/release-audit.mjs
scripts/verify-release-archive.py
src/app/App.tsx
src/packs/canonical-language-registry.data.json
src/packs/canonical-language-registry.ts
src/packs/language-profiles.ts
src/ui/LanguageLabel.tsx
src/ui/SupportStatus.tsx
src/ui/language-presentation.ts
src/ui/styles.css
tests/app/ui-copy.test.ts
tests/domain/compiler.test.ts
tests/domain/language-profile-validation.test.ts
tests/e2e/preview.spec.ts
tests/release/release-audit.test.ts
tests/release/test_verify_release_archive.py
```

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
3. Checkpoint archive repair, Generic catalog, beginner presentation, and Pages
   policy separately; then qualify their clean combined descendant.
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
