# Preview 4 closed release tooling

## Objective

Provide one shared deterministic packager with closed Preview 3 and Preview 4 identities. Preserve every qualified Preview 3 byte and observable CLI/error while blocking cross-version source, stage, manifest, ledger, and predecessor combinations. This local package creates no real release output or public claim.

## Source of truth

`docs/RELEASE-WORKFLOW.md`; ADR-029 and ADR-032–ADR-035; `PREVIEW-3-SOURCE-MANIFEST-AND-PACKAGER.md`; recorded Preview 3 package/public evidence; clean base `3a2cfd0f81a6a9513991eef4f3b1e604185536bc`.

## In scope

```text
scripts/release_packager.py
scripts/preview3-package.py
scripts/preview4-package.py
tests/release/test_release_packager.py
docs/work-packages/PREVIEW-4-RELEASE-TOOLING.md
docs/DECISIONS.md
docs/PROJECT-STATE.md
docs/TRACEABILITY.md
```

The shared test is a rename of `test_preview3_package.py`. One immutable table contains exactly `preview3` and `preview4`; each spec pins version, committed `package.json`, all source/stage/final/evidence/contract paths, exact qualified predecessor bytes, and ledger lineage. Executable adapters call only `main_for("preview3")` or `main_for("preview4")`.

## Out of scope

Archive verifier, Pages workflow, release-audit implementation, `package.json`, public wording, product/compiler/language/UI/privacy behavior, real freeze/build/stage/promotion/package/tag/push/release/deploy, network access, and Gate 4+ work. Preview 4 promotion remains blocked until a separate package makes verifier and workflow selection spec-aware.

## Acceptance

| ID | Observable requirement |
|---|---|
| `P4-RT-01` | One shared engine and two pinned executable adapters; no CLI flag, alias, casing, file, environment, locale, clock, network, or default selects identity. |
| `P4-RT-02` | Preview 3 CLI/help/stderr, schemas, serialization, ZIP, paths, ledger, reports, writes, and negative fixtures remain byte-for-byte exact. |
| `P4-RT-03` | Bounded duplicate-rejecting JSON parsing requires exact committed `package.json.version` before output. |
| `P4-RT-04` | Closed independent literals pin every Preview 3/4 path and reject unknown IDs, reroutes, and case-insensitive collisions. |
| `P4-RT-05` | Preview 4 pins the complete qualified Preview 3 ledger plus archive/manifest path, length, and SHA-256; prefix, suffix, joint replacement, active-path, or committed-byte drift fails. |
| `P4-RT-06` | Cross-version source, stage, manifest, version, predecessor, internal ID, and CLI-override cases fail closed; identical distributable ZIP hashes remain legal. |
| `P4-RT-07` | Fixtures are development/regression evidence only; no prospective, linguistic, public, deployed, or release-ready claim is made. |
| `P4-RT-08` | Focused/full release tests, Vitest, both typechecks, build/audit, 11 checksums, domain/cache/diff scans, exact accounting, and independent review pass. |

## Verification

```text
python -B -m unittest tests/release/test_release_packager.py
python -B -m unittest discover -s tests/release -p "test_*.py"
pnpm test
pnpm typecheck
pnpm build && node scripts/release-audit.mjs
python -B -c "import runpy; from pathlib import Path; m=runpy.run_path('scripts/verify-release-archive.py'); print(len(m['verify_checksums'](Path('SHA256SUMS'))))"
```

Also run the established domain/cache scans, `git diff --check`, exact allowlist/net accounting, Preview 3 golden comparison, and exact-hash independent review. Use bundled runtimes, Python `-B`, and only temporary synthetic repositories; never invoke a real release command here.

## Stop conditions

Stop on any Preview 3 byte/CLI/error drift; non-Preview-4 source accepted by Preview 4; unpinned predecessor/ledger bytes; schema 2, eighth package path, relaxed `dist`, deployment rebuild, or overwrite requirement; unexpected real output; base/scope drift; baseline failure; or net change at/above 500 lines.

## Handoff

Record exact paths/hashes/net size, checks, golden evidence, verdict, and limits. After a passing checkpoint, only the separately contracted spec-aware archive-verifier/Pages package is eligible; source identity, freezing, packaging, and publication remain forbidden.
